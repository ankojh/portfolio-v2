// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { askQuestion } from "@/lib/api";
import { usePortfolioChat } from "./usePortfolioChat";

vi.mock("@/lib/api", () => ({ askQuestion: vi.fn() }));
const askMock = vi.mocked(askQuestion);

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const onError = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
  return { ...renderHook(() => usePortfolioChat({ onError }), { wrapper }), onError };
}

function pendingAnswer() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  askMock.mockReturnValueOnce(promise);
  return { resolve, reject };
}

describe("usePortfolioChat (mocked transport)", () => {
  beforeEach(() => { askMock.mockReset(); });
  afterEach(cleanup);

  it("ignores blank questions and prevents two submissions in the same event", async () => {
    const pending = pendingAnswer();
    const { result } = setup();
    act(() => {
      expect(result.current.submitQuestion("   ")).toBe(false);
      expect(result.current.submitQuestion("  Tell me about Dor  ")).toBe(true);
      expect(result.current.submitQuestion("Duplicate click")).toBe(false);
    });
    await waitFor(() => expect(askMock).toHaveBeenCalledOnce());
    expect(askMock.mock.calls[0][0].question).toBe("Tell me about Dor");
    await act(async () => { pending.resolve(); });
  });

  it("streams one answer and includes only completed turns in follow-up history", async () => {
    askMock.mockImplementationOnce(async ({ onDelta }) => { onDelta("Dor is "); onDelta("a news globe."); });
    const { result } = setup();
    act(() => { result.current.submitQuestion("What is Dor?"); });
    await waitFor(() => expect(result.current.askMutation.isPending).toBe(false));
    expect(result.current.messages.slice(1).map(({ role, content }) => ({ role, content }))).toEqual([
      { role: "user", content: "What is Dor?" },
      { role: "assistant", content: "Dor is a news globe." },
    ]);
    askMock.mockImplementationOnce(async ({ onDelta }) => { onDelta("It makes sources inspectable."); });
    act(() => { result.current.submitQuestion("Why a globe?"); });
    await waitFor(() => expect(askMock).toHaveBeenCalledTimes(2));
    expect(askMock.mock.calls[1][0].history).toEqual([
      { role: "user", content: "What is Dor?" },
      { role: "assistant", content: "Dor is a news globe." },
    ]);
    await waitFor(() => expect(result.current.askMutation.isPending).toBe(false));
  });

  it("removes a partial failed answer, retains the question and retries without duplicate turns", async () => {
    const pending = pendingAnswer();
    const { result, onError } = setup();
    act(() => { result.current.submitQuestion("What is Transformer Lab?"); });
    await waitFor(() => expect(askMock).toHaveBeenCalledOnce());
    act(() => { askMock.mock.calls[0][0].onDelta("Incomplete answer"); });
    expect(result.current.messages.at(-1)?.content).toBe("Incomplete answer");
    await act(async () => { pending.reject(new Error("Please retry.")); });
    await waitFor(() => expect(result.current.chatError).toBe("Please retry."));
    await waitFor(() => expect(result.current.askMutation.isPending).toBe(false));
    expect(result.current.messages.slice(1).map(({ content }) => content)).toEqual(["What is Transformer Lab?"]);
    expect(onError).toHaveBeenCalledWith("Please retry.");

    askMock.mockImplementationOnce(async ({ onDelta }) => { onDelta("An editable model lab."); });
    act(() => { result.current.retryQuestion(); result.current.retryQuestion(); });
    await waitFor(() => expect(askMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.askMutation.isPending).toBe(false));
    expect(askMock.mock.calls[1][0].question).toBe("What is Transformer Lab?");
    expect(askMock.mock.calls[1][0].history).toEqual([]);
    expect(result.current.chatError).toBeNull();
    expect(result.current.messages.slice(1).map(({ role, content }) => ({ role, content }))).toEqual([
      { role: "user", content: "What is Transformer Lab?" },
      { role: "assistant", content: "An editable model lab." },
    ]);
  });

  it("replaces an abandoned failed question without adding it to conversation history", async () => {
    askMock.mockRejectedValueOnce(new Error("Unavailable. Please retry."));
    const { result } = setup();
    act(() => { result.current.submitQuestion("Failed question"); });
    await waitFor(() => expect(result.current.chatError).not.toBeNull());
    await waitFor(() => expect(result.current.askMutation.isPending).toBe(false));
    askMock.mockImplementationOnce(async ({ onDelta }) => { onDelta("A successful answer"); });
    act(() => { result.current.submitQuestion("New question"); });
    await waitFor(() => expect(askMock).toHaveBeenCalledTimes(2));
    expect(askMock.mock.calls[1][0].history).toEqual([]);
    expect(result.current.messages.some(({ content }) => content === "Failed question")).toBe(false);
    await waitFor(() => expect(result.current.askMutation.isPending).toBe(false));
  });

  it("aborts an active request on unmount and suppresses cancellation errors", async () => {
    askMock.mockImplementationOnce(({ signal }) => new Promise((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    const { result, unmount, onError } = setup();
    act(() => { result.current.submitQuestion("What has Ankit built?"); });
    await waitFor(() => expect(askMock).toHaveBeenCalledOnce());
    const signal = askMock.mock.calls[0][0].signal;
    expect(signal?.aborted).toBe(false);
    await act(async () => { unmount(); });
    expect(signal?.aborted).toBe(true);
    expect(onError).not.toHaveBeenCalled();
  });
});
