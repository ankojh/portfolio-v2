import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { ArrowUp, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IntroCards } from "@/components/IntroCards";
import { ResumeButton } from "@/components/ResumeButton";
import { StatusFace } from "@/components/StatusFace";
import { introCards } from "@/data/profile";

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

type TopQuestionsResponse = {
  questions: Array<{
    question: string;
    asked_count: number;
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

async function getTopQuestions(): Promise<TopQuestionsResponse> {
  const response = await fetch(`${apiBaseUrl || "/api"}/questions/top`);

  if (!response.ok) {
    throw new Error("Top questions request failed");
  }

  return response.json() as Promise<TopQuestionsResponse>;
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
  const [introActiveIndex, setIntroActiveIndex] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
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
  const { data: topQuestionsData } = useQuery({
    queryKey: ["top-questions"],
    queryFn: getTopQuestions,
    enabled: introComplete,
    staleTime: 60_000,
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
  const topQuestions = topQuestionsData?.questions ?? [];
  const showTopQuestions = messages.length === 1 && messages[0]?.id === "initial" && topQuestions.length > 0;

  function submitQuestion(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  function finishIntro() {
    setIntroComplete(true);
  }

  function advanceIntro() {
    setIntroActiveIndex((current) => {
      const next = current + 1;
      if (next >= introCards.length) {
        finishIntro();
        return current;
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Pinned to the tab's top-right corner, independent of the centered content. */}
      <div className="fixed right-2 top-2 z-50">
        <StatusFace
          apiOk={!isError && data?.status === "ok"}
          dbOk={!isError && data?.database === "ok"}
          loading={isLoading}
        />
      </div>
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-5 sm:px-6">
        <header className="flex items-center justify-between border-b border-border pb-3">
          <h1 className="text-lg font-semibold tracking-normal">Ankit Ojha's Portfolio</h1>
          {/* Clear the fixed corner face on narrow screens where the header meets the edge. */}
          <ResumeButton className="mr-8 md:mr-0" />
        </header>

        {!introComplete ? (
          <section className="flex flex-1 flex-col">
            <IntroCards
              activeIndex={introActiveIndex}
              onAdvance={advanceIntro}
              onSkip={finishIntro}
            />
          </section>
        ) : (
          <section className="flex flex-1 flex-col py-5">
            <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
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
                {showTopQuestions && (
                  <div className="flex max-w-[85%] flex-col gap-2">
                    <p className="text-xs text-muted-foreground">Popular questions</p>
                    <div className="flex flex-wrap gap-2">
                      {topQuestions.map((topQuestion) => (
                        <button
                          key={topQuestion.question}
                          type="button"
                          className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs leading-5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => submitQuestion(topQuestion.question)}
                          disabled={askMutation.isPending}
                        >
                          {topQuestion.question}
                        </button>
                      ))}
                    </div>
                  </div>
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
            <div className="mt-3 flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
              <Scale className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                Chat history is on. This is not a GDPR force field, so maybe do not paste
                your passport, tax secrets, or grandma's lasagna recipe.
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
