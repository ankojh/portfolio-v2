import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { ServiceHealth } from "@/components/ServiceHealth";
import { askSuggestions } from "@/content/site";
import { useAutosizeTextarea } from "@/hooks/useAutosizeTextarea";
import { usePortfolioChat } from "@/hooks/usePortfolioChat";
import { cn } from "@/lib/utils";

/**
 * Ask Ankit, embedded in the contact section. The site has to read clearly
 * without it, so it stays compact until someone asks a question.
 */
export function AskAnkit({ onError }: { onError: (message: string) => void }) {
  const { messages, submitQuestion, askMutation } = usePortfolioChat({ onError });
  const pending = askMutation.isPending;
  const conversation = messages.filter((message) => message.id !== "initial");
  const suggestions = askSuggestions.slice(0, 3);

  const logRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages, pending]);

  return (
    <div className="rounded-[20px] bg-ground p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[23px] font-semibold tracking-tight">Ask Ankit</h3>
        <ServiceHealth />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-body">Explore my decisions, projects and experience through a chat grounded in my notes.</p>

      {conversation.length > 0 && (
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="mt-4 flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1"
        >
          {conversation.map((message) => (
            <p
              key={message.id}
              className={cn(
                "max-w-[88%] whitespace-pre-wrap px-3.5 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "self-end rounded-[14px_14px_4px_14px] bg-ink text-ground"
                  : "self-start rounded-[14px_14px_14px_4px] border border-[#E4D9C7] bg-white text-ink",
              )}
            >
              {message.content}
            </p>
          ))}
          {pending && conversation[conversation.length - 1]?.role === "user" && (
            <p className="self-start rounded-[14px_14px_14px_4px] border border-[#E4D9C7] bg-white px-3.5 py-3 text-sm text-quiet">
              Thinking…
            </p>
          )}
        </div>
      )}

      <AskComposer disabled={pending} onSubmit={submitQuestion} />

      {conversation.length === 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {suggestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={pending}
              onClick={() => submitQuestion(question)}
              className="min-h-9 rounded-full border border-rule bg-paper px-3 text-left text-[12.5px] font-medium text-body transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3.5 text-xs leading-relaxed text-quiet">
        Questions are stored to improve answers, so please don’t share anything private.
      </p>
    </div>
  );
}

function AskComposer({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (question: string) => boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [question, setQuestion] = useState("");
  useAutosizeTextarea(textareaRef, question, 4);

  function submit() {
    if (onSubmit(question)) {
      setQuestion("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    submit();
  }

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <label htmlFor="ask-question" className="label text-[10.5px]">
        Your question
      </label>
      <div className="mt-2 flex items-end gap-2">
        <textarea
          id="ask-question"
          ref={textareaRef}
          rows={1}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. What did Ankit own at Pulley?"
          className="min-h-[46px] min-w-0 flex-1 resize-none rounded-xl border border-[#D5C6AE] bg-white px-3.5 py-3 text-[15px] leading-5 text-ink outline-none placeholder:text-quiet focus-visible:border-terra"
        />
        <button
          type="submit"
          disabled={disabled || !question.trim()}
          aria-label="Send question"
          className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-ink text-ground transition-colors hover:bg-[#3A322A] disabled:opacity-40"
        >
          <ArrowUp className="size-[18px]" />
        </button>
      </div>
    </form>
  );
}
