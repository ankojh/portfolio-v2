import { readServerSentEvents } from "@/lib/sse";
import { getClientMetadata } from "@/lib/clientMetadata";
import type {
  ChatHistoryTurn,
  HealthResponse,
  TopQuestionsResponse,
} from "@/types/chat";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, { signal: AbortSignal.timeout(75_000) });

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json() as Promise<HealthResponse>;
}

export async function getTopQuestions(): Promise<TopQuestionsResponse> {
  const response = await fetch(`${apiBaseUrl}/questions/top`);

  if (!response.ok) {
    throw new Error("Top questions request failed");
  }

  return response.json() as Promise<TopQuestionsResponse>;
}

export function recordResumeDownload(resumeUrl: string): void {
  const body = JSON.stringify({
    resume_url: resumeUrl,
    client_metadata: getClientMetadata(),
  });
  const url = `${apiBaseUrl}/resume/download`;

  if (navigator.sendBeacon) {
    const payload = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(url, payload)) {
      return;
    }
  }

  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics failures should not block the browser download.
  });
}

export async function askQuestion({
  question,
  history,
  onDelta,
  signal,
}: {
  question: string;
  history: ChatHistoryTurn[];
  onDelta: (delta: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let timedOut = false;
  let timeout: ReturnType<typeof setTimeout>;
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 90_000);
  };
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  resetTimeout();
  try {
    const response = await fetch(`${apiBaseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ question, history, client_metadata: getClientMetadata() }),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error("You’ve reached the question limit. Please try again in a little while.");
      if (response.status >= 500 || response.status === 409) throw new Error("Ask Ankit is temporarily unavailable. Please retry in a moment.");
      const body = await response.json().catch(() => null) as { detail?: unknown } | null;
      throw new Error(typeof body?.detail === "string" ? body.detail : "That question couldn’t be sent. Please try again.");
    }
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/event-stream") || !response.body) {
      throw new Error("Ask Ankit couldn’t connect. Please retry in a moment.");
    }
    await readServerSentEvents(response.body, (delta) => { resetTimeout(); onDelta(delta); });
  } catch (error) {
    if (timedOut) throw new Error("Ask Ankit took too long to respond. The service may be waking up — please retry.");
    if (controller.signal.aborted) throw error;
    if (error instanceof TypeError) throw new Error("Couldn’t reach Ask Ankit. Check your connection and retry.");
    throw error;
  } finally {
    clearTimeout(timeout!);
    signal?.removeEventListener("abort", abort);
  }
}
