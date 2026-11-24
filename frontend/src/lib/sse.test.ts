import { describe, expect, it, vi } from "vitest";

import { readServerSentEvents } from "./sse";

const encoder = new TextEncoder();

function byteStream(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

function stream(text: string) {
  return byteStream([encoder.encode(text)]);
}

describe("readServerSentEvents", () => {
  it("delivers ordered deltas at every byte split, including split UTF-8 characters", async () => {
    const bytes = encoder.encode('data: {"delta":"Ankit’s "}\n\ndata: {"delta":"work 🌍"}\n\ndata: {"done":true}\n\n');
    for (let split = 1; split < bytes.length; split++) {
      const deltas: string[] = [];
      await readServerSentEvents(byteStream([bytes.slice(0, split), bytes.slice(split)]), (delta) => deltas.push(delta));
      expect(deltas, `byte split ${split}`).toEqual(["Ankit’s ", "work 🌍"]);
    }
    const deltas: string[] = [];
    await readServerSentEvents(byteStream(Array.from(bytes, (_, index) => bytes.slice(index, index + 1))), (delta) => deltas.push(delta));
    expect(deltas).toEqual(["Ankit’s ", "work 🌍"]);
  });

  it("handles CRLF delimiters split between every byte and a final buffered done event", async () => {
    const bytes = encoder.encode(': heartbeat\r\nevent: message\r\ndata:{"delta":"Ready"}\r\n\r\ndata: {"done":true}');
    const onDelta = vi.fn();
    await readServerSentEvents(byteStream(Array.from(bytes, (_, index) => bytes.slice(index, index + 1))), onDelta);
    expect(onDelta.mock.calls).toEqual([["Ready"]]);
  });

  it("joins multiline data and ignores comment and unrelated event fields", async () => {
    const onDelta = vi.fn();
    await readServerSentEvents(stream(': ping\n\nid: 42\nevent: answer\ndata: {\ndata: "delta": "Grounded answer"\ndata: }\n\ndata: {"done":true}\n\n'), onDelta);
    expect(onDelta.mock.calls).toEqual([["Grounded answer"]]);
  });

  it("accepts a done event without a trailing newline", async () => {
    const onDelta = vi.fn();
    await expect(readServerSentEvents(stream('data: {"delta":"Answer"}\n\ndata: {"done":true}'), onDelta)).resolves.toBeUndefined();
    expect(onDelta).toHaveBeenCalledWith("Answer");
  });

  it("stops after done without waiting for the connection to close", async () => {
    const cancel = vi.fn();
    const openStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"delta":"Complete"}\n\ndata: {"done":true}\n\n'));
      },
      cancel,
    });
    await readServerSentEvents(openStream, vi.fn());
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("rejects an explicit stream error after partial output", async () => {
    const onDelta = vi.fn();
    await expect(readServerSentEvents(stream('data: {"delta":"Partial"}\n\ndata: {"error":"Please retry."}\n\n'), onDelta)).rejects.toThrow();
    expect(onDelta.mock.calls).toEqual([["Partial"]]);
  });

  it.each([
    ["missing done", 'data: {"delta":"Partial"}\n\n'],
    ["empty stream", ""],
    ["done without answer", 'data: {"done":true}\n\n'],
    ["whitespace-only answer", 'data: {"delta":"  \\n"}\n\ndata: {"done":true}\n\n'],
    ["malformed JSON", 'data: {broken}\n\n'],
    ["invalid delta type", 'data: {"delta":42}\n\ndata: {"done":true}\n\n'],
  ])("rejects %s", async (_reason, data) => {
    await expect(readServerSentEvents(stream(data), vi.fn())).rejects.toThrow();
  });

  it("propagates a failed stream read", async () => {
    const failed = new ReadableStream<Uint8Array>({
      pull(controller) { controller.error(new Error("Connection interrupted")); },
    });
    await expect(readServerSentEvents(failed, vi.fn())).rejects.toThrow();
  });
});
