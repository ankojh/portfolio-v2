import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

type HealthResponse = {
  status: "ok" | "degraded";
  database: "ok" | "unavailable";
  app_version: string;
};

type AskResponse = {
  answer: string;
  sources: Array<{
    source_path: string;
    title: string;
    similarity: number;
    content: string;
  }>;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AskResponse["sources"];
};

type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type NavigatorWithHints = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl || "/api"}/health`);

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json() as Promise<HealthResponse>;
}

async function askQuestion(question: string): Promise<AskResponse> {
  const response = await fetch(`${apiBaseUrl || "/api"}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      client_metadata: getClientMetadata(),
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Ask request failed");
  }

  return response.json() as Promise<AskResponse>;
}

function getClientMetadata(): Record<string, unknown> {
  const navigatorWithHints = window.navigator as NavigatorWithHints;
  const connection = navigatorWithHints.connection;

  return {
    page_url: window.location.href,
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    user_agent: navigator.userAgent,
    do_not_track: navigator.doNotTrack,
    hardware_concurrency: navigator.hardwareConcurrency,
    device_memory_gb: navigatorWithHints.deviceMemory,
    max_touch_points: navigator.maxTouchPoints,
    color_scheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixel_depth: window.screen.pixelDepth,
      device_pixel_ratio: window.devicePixelRatio,
    },
    connection: connection
      ? {
          effective_type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          save_data: connection.saveData,
        }
      : null,
  };
}

export function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: "What would you like to know?",
    },
  ]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30_000,
  });
  const askMutation = useMutation({
    mutationFn: askQuestion,
    onSuccess: (response) => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ]);
    },
    onError: (error) => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error instanceof Error ? error.message : "Something went wrong.",
        },
      ]);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || askMutation.isPending) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuestion,
      },
    ]);
    setQuestion("");
    askMutation.mutate(trimmedQuestion);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-5 sm:px-6">
        <header className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h1 className="text-lg font-semibold tracking-normal">Ankit Ojha's Portfolio</h1>
          </div>
          <div className="flex items-center gap-2" aria-label="System status">
            <StatusDot label="API" ok={!isError && data?.status === "ok"} loading={isLoading} />
            <StatusDot label="DB" ok={!isError && data?.database === "ok"} loading={isLoading} />
          </div>
        </header>

        <section className="flex flex-1 flex-col py-5">
          <div className="flex min-h-[calc(100vh-148px)] flex-col rounded-lg border border-border bg-card">
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {message.sources.map((source) => source.title).join(", ")}
                    </p>
                  )}
                </article>
              ))}
              {askMutation.isPending && (
                <p className="max-w-[85%] rounded-lg bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Thinking...
                </p>
              )}
            </div>

            <form className="flex gap-2 border-t border-border p-3 sm:p-4" onSubmit={handleSubmit}>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="min-h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Ask anything..."
                disabled={askMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={!question.trim() || askMutation.isPending}
              >
                <ArrowUp className="size-4" />
              </Button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatusDot({
  label,
  ok,
  loading,
}: {
  label: string;
  ok: boolean;
  loading: boolean;
}) {
  const status = loading ? "Checking" : ok ? "Active" : "Not active";
  const tooltip = `${label} ${status}`;

  return (
    <span
      className="group relative inline-flex size-5 items-center justify-center"
      title={tooltip}
      aria-label={tooltip}
      tabIndex={0}
    >
      <span
        className={`size-2.5 rounded-full ${loading ? "animate-pulse bg-muted-foreground/40" : ok ? "bg-emerald-500" : "bg-destructive"}`}
      />
      <span className="pointer-events-none absolute right-0 top-6 z-10 whitespace-nowrap rounded border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}
