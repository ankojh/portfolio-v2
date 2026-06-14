import {
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";
import { ArrowUp } from "lucide-react";

import { useAutosizeTextarea } from "@/hooks/useAutosizeTextarea";
import { Button } from "@/components/ui/button";

export function ChatComposer({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (question: string) => boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [question, setQuestion] = useState("");
  useAutosizeTextarea(textareaRef, question, 5);

  function submitCurrentQuestion() {
    if (onSubmit(question)) {
      setQuestion("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCurrentQuestion();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    submitCurrentQuestion();
  }

  return (
    <form
      className="flex gap-2 border-t border-border/80 bg-card/95 p-3 sm:p-4"
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="min-h-11 flex-1 resize-none rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder="Ask anything..."
        disabled={disabled}
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Send message"
        disabled={!question.trim() || disabled}
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  );
}
