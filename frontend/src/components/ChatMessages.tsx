import type { ChatMessage } from "@/types/chat";

export function ChatMessages({
  messages,
  pending,
}: {
  messages: ChatMessage[];
  pending: boolean;
}) {
  return (
    <>
      {messages.map((message) => (
        <article
          key={message.id}
          className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${
            message.role === "user"
              ? "ml-auto bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </article>
      ))}
      {pending && messages[messages.length - 1]?.role === "user" && (
        <p className="max-w-[85%] rounded-lg bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
          Thinking...
        </p>
      )}
    </>
  );
}
