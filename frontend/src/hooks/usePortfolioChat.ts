import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { askQuestion } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content: "What would you like to know?",
};

export function usePortfolioChat({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      let messageId: string | null = null;
      const history = messages
        .filter((message) => message.id !== INITIAL_MESSAGE.id)
        .slice(-10)
        .map((message) => ({
          role: message.role,
          content: message.content.slice(0, 4000),
        }));

      await askQuestion({
        question,
        history,
        onDelta: (delta) => {
          if (messageId === null) {
            messageId = crypto.randomUUID();
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: messageId as string, role: "assistant", content: delta },
            ]);
            return;
          }

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === messageId
                ? { ...message, content: message.content + delta }
                : message,
            ),
          );
        },
      });
    },
    onError: (error) => {
      onError(error instanceof Error ? error.message : "Something went wrong.");
    },
  });

  function submitQuestion(question: string) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || askMutation.isPending) {
      return false;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuestion,
      },
    ]);
    askMutation.mutate(trimmedQuestion);
    return true;
  }

  return {
    messages,
    submitQuestion,
    askMutation,
  };
}
