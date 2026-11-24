import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { askQuestion } from "./api";

vi.mock("./clientMetadata", () => ({ getClientMetadata: () => ({ locale: "en-US" }) }));

const encoder = new TextEncoder();
const completeAnswer = 'data: {"delta":"A grounded answer"}\n\ndata: {"done":true}\n\n';

function sseResponse(text = completeAnswer) {
  return new Response(text, { headers: { "Content-Type": "text/event-stream; charset=utf-8" } });
}

function abortError() {
  return new DOMException("The operation was aborted", "AbortError");
}

describe("askQuestion transport (mocked fetch)", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => { vi.useRealTimers(); });

  it("posts the question and completed history and delivers a streamed answer", async () => {
    fetchMock.mockResolvedValueOnce(sseResponse());
    const onDelta = vi.fn();
    const history = [{ role: "user" as const, content: "What is Dor?" }, { role: "assistant" as const, content: "A news globe." }];
    await askQuestion({ question: "What did Ankit build?", history, onDelta });
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/ask$/);
    expect(options?.method).toBe("POST");
    expect(new Headers(options?.headers).get("accept")).toBe("text/event-stream");
    expect(JSON.parse(options?.body as string)).toEqual({ question: "What did Ankit build?", history, client_metadata: { locale: "en-US" } });
    expect(onDelta.mock.calls).toEqual([["A grounded answer"]]);
  });

  it.each(["application/json", "text/html", "text/plain"])("rejects a successful %s response instead of treating it as an answer", async (contentType) => {
    fetchMock.mockResolvedValueOnce(new Response(completeAnswer, { headers: { "Content-Type": contentType } }));
    const onDelta = vi.fn();
    await expect(askQuestion({ question: "Hi", history: [], onDelta })).rejects.toThrow(/retry|connect/i);
    expect(onDelta).not.toHaveBeenCalled();
  });

  it("rejects an SSE response with no body", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { headers: { "Content-Type": "text/event-stream" } }));
    await expect(askQuestion({ question: "Hi", history: [], onDelta: vi.fn() })).rejects.toThrow();
  });

  it.each([429, 500, 503])("gives a recoverable error for HTTP %s without exposing upstream details", async (status) => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ detail: "secret-provider-token database-internal-host" }), { status, headers: { "Content-Type": "application/json" } }));
    await expect(askQuestion({ question: "Hi", history: [], onDelta: vi.fn() })).rejects.toThrow(/try again|retry/i);
    fetchMock.mockResolvedValueOnce(new Response("secret-provider-token database-internal-host", { status }));
    await expect(askQuestion({ question: "Hi", history: [], onDelta: vi.fn() })).rejects.not.toThrow(/secret-provider-token|database-internal-host/);
  });

  it("turns a network failure into a useful retry message", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(askQuestion({ question: "Hi", history: [], onDelta: vi.fn() })).rejects.toThrow(/connection|reach/i);
  });

  it("forwards cancellation while connecting and removes the caller's abort listener", async () => {
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    fetchMock.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(abortError()));
    }));
    const request = askQuestion({ question: "Hi", history: [], onDelta: vi.fn(), signal: controller.signal });
    const rejection = expect(request).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await rejection;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
  });

  it("honors a signal that was already aborted", async () => {
    fetchMock.mockImplementationOnce(async (_url, options) => {
      if (options?.signal?.aborted) throw abortError();
      return sseResponse();
    });
    const controller = new AbortController();
    controller.abort();
    await expect(askQuestion({ question: "Hi", history: [], onDelta: vi.fn(), signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
  });

  it("cancels an in-progress streamed response when the caller aborts", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementationOnce(async (_url, options) => {
      const body = new ReadableStream<Uint8Array>({
        start(streamController) {
          streamController.enqueue(encoder.encode('data: {"delta":"Partial"}\n\n'));
          options?.signal?.addEventListener("abort", () => streamController.error(abortError()));
        },
      });
      return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
    });
    let delivered!: () => void;
    const received = new Promise<void>((resolve) => { delivered = resolve; });
    const onDelta = vi.fn(() => { delivered(); });
    const request = askQuestion({ question: "Hi", history: [], onDelta, signal: controller.signal });
    const rejection = expect(request).rejects.toMatchObject({ name: "AbortError" });
    await received;
    expect(onDelta).toHaveBeenCalledWith("Partial");
    controller.abort();
    await rejection;
  });

  it("bounds a connection that never returns headers", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(abortError()));
    }));
    const request = askQuestion({ question: "Hi", history: [], onDelta: vi.fn() });
    const rejection = expect(request).rejects.toThrow(/too long|timed out/i);
    await vi.advanceTimersByTimeAsync(90_000);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renews the idle deadline when a delta arrives, then terminates a stalled answer", async () => {
    vi.useFakeTimers();
    let streamController!: ReadableStreamDefaultController<Uint8Array>;
    fetchMock.mockImplementationOnce(async (_url, options) => {
      const body = new ReadableStream<Uint8Array>({ start(controller) { streamController = controller; } });
      options?.signal?.addEventListener("abort", () => streamController.error(abortError()));
      return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
    });
    const onDelta = vi.fn();
    const request = askQuestion({ question: "Hi", history: [], onDelta });
    const rejection = expect(request).rejects.toThrow(/too long|timed out/i);
    await vi.advanceTimersByTimeAsync(89_000);
    streamController.enqueue(encoder.encode('data: {"delta":"Started"}\n\n'));
    await vi.advanceTimersByTimeAsync(0);
    expect(onDelta).toHaveBeenCalledWith("Started");
    await vi.advanceTimersByTimeAsync(89_000);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1_000);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up its timeout and abort listener after success", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    fetchMock.mockResolvedValueOnce(sseResponse());
    await askQuestion({ question: "Hi", history: [], onDelta: vi.fn(), signal: controller.signal });
    expect(vi.getTimerCount()).toBe(0);
    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
  });
});
