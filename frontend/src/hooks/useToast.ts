import { useEffect, useRef, useState } from "react";

export function useToast(timeoutMs = 3500) {
  const timeoutRef = useRef<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function showToast(nextMessage: string) {
    setMessage(nextMessage);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setMessage(null), timeoutMs);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    toastMessage: message,
    showToast,
  };
}
