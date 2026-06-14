export function TopQuestionSuggestions({
  questions,
  disabled,
  onSelect,
}: {
  questions: string[];
  disabled: boolean;
  onSelect: (question: string) => void;
}) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="flex max-w-[85%] flex-col gap-2">
      <p className="text-xs text-muted-foreground">Popular questions</p>
      <div className="flex flex-col items-start gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs leading-5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onSelect(question)}
            disabled={disabled}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
