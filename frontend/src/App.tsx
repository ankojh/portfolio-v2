import { useQuery } from "@tanstack/react-query";
import { ArrowUp, Bot, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HealthResponse = {
  status: "ok" | "degraded";
  database: "ok" | "unavailable";
  app_version: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl || "/api"}/health`);

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json() as Promise<HealthResponse>;
}

export function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30_000,
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Portfolio Chat</p>
            <h1 className="text-2xl font-semibold tracking-normal">Ankit Ojha's Portfolio</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span
                className={`size-2 rounded-full ${
                  data?.status === "ok" ? "bg-emerald-500" : "bg-destructive"
                }`}
              />
            )}
            <span>{data?.status ?? "checking"}</span>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[1fr_320px]">
          <section className="flex min-h-[560px] flex-col rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="size-5" />
              </div>
              <div>
                <h2 className="font-medium">Ask about my work</h2>
                <p className="text-sm text-muted-foreground">
                  Chat experience placeholder wired to the live app health API.
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="max-w-[78%] rounded-lg bg-muted px-4 py-3 text-sm">
                Backend is connected. The next step is to stream portfolio-aware answers here.
              </div>
              <div className="ml-auto max-w-[78%] rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground">
                What version is running?
              </div>
              <div className="max-w-[78%] rounded-lg bg-muted px-4 py-3 text-sm">
                {isLoading && "Checking the API and database..."}
                {isError && "The API health check is not responding yet."}
                {data && `Version ${data.app_version} is stored in Postgres and returned by FastAPI.`}
              </div>
            </div>

            <form className="flex gap-2 border-t border-border p-4">
              <input
                className="min-h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Ask anything..."
                disabled
              />
              <Button type="button" size="icon" aria-label="Send message" disabled>
                <ArrowUp className="size-4" />
              </Button>
            </form>
          </section>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <StatusRow label="API" value={isError ? "unavailable" : data?.status ?? "checking"} />
                <StatusRow label="Database" value={isError ? "unavailable" : data?.database ?? "checking"} />
                <StatusRow label="Version" value={data?.app_version ?? "checking"} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="rounded-md border border-border px-2 py-1 font-medium">{value}</span>
    </div>
  );
}
