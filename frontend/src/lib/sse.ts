/** Decode our SSE protocol across arbitrary network and UTF-8 boundaries. */
export async function readServerSentEvents(
  stream: ReadableStream<Uint8Array>,
  onDelta: (delta: string) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  let answer = "";

  function consume(event: string) {
    const data = event.split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");
    if (!data) return;
    let payload: unknown;
    try { payload = JSON.parse(data); } catch { throw new Error("The answer was interrupted. Please retry your question."); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("The answer was interrupted. Please retry your question.");
    }
    const message = payload as Record<string, unknown>;
    if (typeof message.error === "string" && message.error) throw new Error(message.error);
    if ("delta" in message) {
      if (typeof message.delta !== "string") throw new Error("The answer was interrupted. Please retry your question.");
      answer += message.delta;
      if (message.delta) onDelta(message.delta);
    }
    if (message.done === true) completed = true;
  }

  try {
    while (!completed) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary: RegExpExecArray | null;
      while (!completed && (boundary = /\r?\n\r?\n/.exec(buffer))) {
        const event = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        consume(event);
      }
      if (done) {
        if (!completed && buffer.trim()) consume(buffer);
        break;
      }
    }
    if (!completed || !answer.trim()) throw new Error("The answer was interrupted. Please retry your question.");
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
