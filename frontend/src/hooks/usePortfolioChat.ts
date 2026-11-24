import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { askQuestion } from "@/lib/api";
import type { ChatHistoryTurn, ChatMessage } from "@/types/chat";

const INITIAL_MESSAGE: ChatMessage = { id: "initial", role: "assistant", content: "What would you like to know?" };
type Attempt = { question: string; history: ChatHistoryTurn[]; userId: string };

export function usePortfolioChat({ onError }: { onError: (message: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const historyRef = useRef<ChatHistoryTurn[]>([]);
  const failedAttempt = useRef<Attempt | null>(null);
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const submitting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; active.current?.abort(); };
  }, []);

  const askMutation = useMutation({
    mutationFn: async (attempt: Attempt) => {
      const controller = new AbortController();
      active.current = controller;
      const assistantId = crypto.randomUUID();
      let answer = "";
      try {
        await askQuestion({
          question: attempt.question,
          history: attempt.history,
          signal: controller.signal,
          onDelta: (delta) => {
            if (!mounted.current) return;
            answer += delta;
            setWaiting(false);
            setMessages((current) => current.some((message) => message.id === assistantId)
              ? current.map((message) => message.id === assistantId ? { ...message, content: message.content + delta } : message)
              : [...current, { id: assistantId, role: "assistant", content: delta }]);
          },
        });
        if (!mounted.current) return;
        historyRef.current = [...attempt.history, { role: "user", content: attempt.question }, { role: "assistant", content: answer }].slice(-10) as ChatHistoryTurn[];
        failedAttempt.current = null;
      } catch (error) {
        if (!mounted.current || controller.signal.aborted && (error as Error)?.name === "AbortError") return;
        // A failed/partial answer must never become conversation context on retry.
        setMessages((current) => current.filter((message) => message.id !== assistantId));
        failedAttempt.current = attempt;
        const message = error instanceof Error ? error.message : "Something went wrong. Please retry.";
        setChatError(message);
        onError(message);
      } finally {
        if (active.current === controller) active.current = null;
        submitting.current = false;
        if (mounted.current) setWaiting(false);
      }
    },
  });

  function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || submitting.current || active.current || askMutation.isPending) return false;
    submitting.current = true;
    const userId = crypto.randomUUID();
    const failed = failedAttempt.current;
    // The previous failed turn stays visible until replaced or retried; it is never sent as history.
    setMessages((current) => [...current.filter((message) => message.id !== failed?.userId), { id: userId, role: "user", content: trimmed }]);
    setChatError(null);
    setWaiting(true);
    askMutation.mutate({ question: trimmed, history: historyRef.current.map((turn) => ({ ...turn, content: turn.content.slice(0, 4000) })), userId });
    return true;
  }

  function retryQuestion() {
    if (!failedAttempt.current || submitting.current || active.current || askMutation.isPending) return;
    submitting.current = true;
    setChatError(null);
    setWaiting(true);
    askMutation.mutate(failedAttempt.current);
  }

  return { messages, submitQuestion, retryQuestion, chatError, waiting, askMutation };
}
