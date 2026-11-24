import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/lib/api";

/** One shared check for every status indicator; database state is unknown on request failure. */
export function ServiceHealth() {
  const { data, isPending, isError, dataUpdatedAt } = useQuery({
    queryKey: ["service-health"],
    queryFn: getHealth,
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: false,
  });

  const state = isError ? "unknown" : isPending ? "checking" : data?.status === "ok" && data.database === "ok" ? "online" : "degraded";
  const label = { online: "Service reachable", checking: "Connecting", degraded: "Service issue", unknown: "Service waking or unavailable" }[state];
  const backend = isError ? "Check failed" : isPending ? "Checking…" : "Responding";
  const database = isError ? "Unknown" : isPending ? "Checking…" : data?.database === "ok" ? "Connected" : "Unavailable";

  return (
    <details className={`service-health service-health--${state}`}>
      <summary aria-label={`${label}. Show backend and database health`}>
        <span className="service-dot" aria-hidden="true" />
        <span aria-live="polite">{label}</span>
        <span className="health-disclosure" aria-hidden="true">⌄</span>
      </summary>
      <div className="health-readout">
        <dl><div><dt>Backend</dt><dd>{backend}</dd></div><div><dt>Database</dt><dd>{database}</dd></div></dl>
        <p>Connection status does not verify answer generation.</p><p>{isError ? "The service may be starting. You can still send a question; status will retry automatically." : isPending ? "Contacting the portfolio service…" : `Checked ${new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · refreshes every 30s`}</p>
      </div>
    </details>
  );
}
