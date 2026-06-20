import { getClientMetadata } from "@/lib/clientMetadata";
import type {
  ChatHistoryTurn,
  HealthResponse,
  TopQuestionsResponse,
} from "@/types/chat";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`);

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
}: {
  question: string;
  history: ChatHistoryTurn[];
  onDelta: (delta: string) => void;
}): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      history,
      client_metadata: getClientMetadata(),
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(errorBody?.detail ?? "Ask request failed");
  }

  if (!response.body) {
    throw new Error("Ask request failed");
  }

  await readServerSentEvents(response.body, onDelta);
}

async function readServerSentEvents(
  stream: ReadableStream<Uint8Array>,
  onDelta: (delta: string) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const payload = parseServerSentEvent(event);
      if (!payload) {
        continue;
      }
      if (payload.error) {
        throw new Error(payload.error);
      }
      if (payload.delta) {
        onDelta(payload.delta);
      }
    }
  }
}

function parseServerSentEvent(event: string): {
  delta?: string;
  error?: string;
  done?: boolean;
} | null {
  const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
  if (!dataLine) {
    return null;
  }

  return JSON.parse(dataLine.slice("data: ".length)) as {
    delta?: string;
    error?: string;
    done?: boolean;
  };
}
