import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getHealth, getTopQuestions } from "@/lib/api";
import { usePortfolioChat } from "@/hooks/usePortfolioChat";
import { useToast } from "@/hooks/useToast";
import { AppToast } from "@/components/AppToast";
import { ChatPanel } from "@/components/ChatPanel";
import { DottedBackground } from "@/components/DottedBackground";
import { IntroCards } from "@/components/IntroCards";
import { ResumeButton } from "@/components/ResumeButton";
import { SocialLinks } from "@/components/SocialLinks";
import { StatusFace } from "@/components/StatusFace";
import { introCards } from "@/data/profile";

export function App() {
  const [introActiveIndex, setIntroActiveIndex] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const { toastMessage, showToast } = useToast();
  const { messages, submitQuestion, askMutation } = usePortfolioChat({
    onError: showToast,
  });
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
  const topQuestions =
    topQuestionsData?.questions.map((question) => question.question) ?? [];
  const showTopQuestions =
    messages.length === 1 &&
    messages[0]?.id === "initial" &&
    topQuestions.length > 0;

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

  function goBackIntro() {
    setIntroActiveIndex((current) => Math.max(0, current - 1));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <DottedBackground />
      {/* Pinned to the tab's top-right corner, independent of the centered content. */}
      <div className="fixed right-2 top-2 z-50">
        <StatusFace
          apiOk={!isError && data?.status === "ok"}
          dbOk={!isError && data?.database === "ok"}
          loading={isLoading}
        />
      </div>
      <section className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-5 sm:px-6">
        <header className="flex items-center justify-end border-b border-border pb-3 sm:justify-between">
          <h1 className="hidden text-lg font-semibold tracking-normal sm:block">
            Ankit Ojha
          </h1>
          {/* Clear the fixed corner face on narrow screens where the header meets the edge. */}
          <div className="mr-8 flex items-center gap-0 sm:gap-1 md:mr-0">
            <SocialLinks />
            <ResumeButton className="ml-0 sm:ml-1" />
          </div>
        </header>

        {!introComplete ? (
          <section className="flex flex-1 flex-col">
            <IntroCards
              activeIndex={introActiveIndex}
              onAdvance={advanceIntro}
              onBack={goBackIntro}
              onSkip={finishIntro}
            />
          </section>
        ) : (
          <ChatPanel
            messages={messages}
            pending={askMutation.isPending}
            topQuestions={topQuestions}
            showTopQuestions={showTopQuestions}
            onSubmitQuestion={submitQuestion}
          />
        )}
      </section>
      <AppToast message={toastMessage} />
    </main>
  );
}
