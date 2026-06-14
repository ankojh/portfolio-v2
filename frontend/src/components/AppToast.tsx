export function AppToast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-md"
    >
      {message}
    </div>
  );
}
