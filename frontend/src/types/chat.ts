export type HealthResponse = {
  status: "ok" | "degraded";
  database: "ok" | "unavailable";
  app_version: string;
};

export type TopQuestionsResponse = {
  questions: Array<{
    question: string;
    asked_count: number;
  }>;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatHistoryTurn = Pick<ChatMessage, "role" | "content">;
