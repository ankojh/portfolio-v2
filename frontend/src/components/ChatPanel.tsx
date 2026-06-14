import { ChatComposer } from "@/components/ChatComposer";
import { ChatMessages } from "@/components/ChatMessages";
import { TopQuestionSuggestions } from "@/components/TopQuestionSuggestions";
import type { ChatMessage } from "@/types/chat";

export function ChatPanel({
  messages,
  pending,
  topQuestions,
  showTopQuestions,
  onSubmitQuestion,
}: {
  messages: ChatMessage[];
  pending: boolean;
  topQuestions: string[];
  showTopQuestions: boolean;
  onSubmitQuestion: (question: string) => boolean;
}) {
  return (
    <section className="flex flex-1 flex-col pb-2 pt-5 sm:py-5">
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border/80 bg-card shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.035]">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
          <ChatMessages messages={messages} pending={pending} />
          {showTopQuestions && (
            <TopQuestionSuggestions
              questions={topQuestions}
              disabled={pending}
              onSelect={onSubmitQuestion}
            />
          )}
        </div>
        <ChatComposer disabled={pending} onSubmit={onSubmitQuestion} />
      </div>
      <div className="mt-2 px-1 text-center text-xs leading-5 text-muted-foreground">
        <p>
          Chat history is on and GDPRn't, so maybe don't paste your passport,
          tax secrets, or grandma's lasagna recipe.
        </p>
      </div>
    </section>
  );
}
