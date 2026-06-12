// A minimal status mark: two health dots become eyes, the mouth smiles when
// everything is healthy, runs a curved loader while checking, and frowns if
// the API or database is down. Each eye has its own tooltip (left = API,
// right = DB).

const SMILE = "M9 16 Q15 21 21 16";
const FROWN = "M9 19 Q15 14 21 19";

const eyeFill = (ok: boolean, loading: boolean) =>
  loading ? "fill-muted-foreground/40" : ok ? "fill-emerald-500" : "fill-destructive";

export function StatusFace({
  apiOk,
  dbOk,
  loading,
}: {
  apiOk: boolean;
  dbOk: boolean;
  loading: boolean;
}) {
  const down = !loading && !(apiOk && dbOk);

  return (
    <span className="relative inline-flex h-7 w-8 items-center justify-center">
      <svg viewBox="0 0 30 26" className={`h-7 w-8 ${loading ? "animate-pulse" : ""}`} fill="none" aria-hidden="true">
        <circle cx="11" cy="10" r="2.3" className={eyeFill(apiOk, loading)} />
        <circle cx="19" cy="10" r="2.3" className={eyeFill(dbOk, loading)} />
        <path
          d={down ? FROWN : SMILE}
          className={
            loading
              ? "animate-mouth-loader stroke-muted-foreground/60"
              : down
                ? "stroke-destructive"
                : "stroke-emerald-500"
          }
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <EyeTip label="API" ok={apiOk} loading={loading} className="left-0" />
      <EyeTip label="DB" ok={dbOk} loading={loading} className="right-0" />
    </span>
  );
}

function EyeTip({
  label,
  ok,
  loading,
  className,
}: {
  label: string;
  ok: boolean;
  loading: boolean;
  className: string;
}) {
  const state = loading ? "Checking" : ok ? "Active" : "Offline";
  const tooltip = `${label} · ${state}`;

  // Transparent hotspot over one eye; tooltip opens left-aligned to the right
  // edge so it never clips past the corner of the screen.
  return (
    <span
      className={`group absolute top-0 h-4 w-4 ${className}`}
      title={tooltip}
      aria-label={tooltip}
      role="img"
      tabIndex={0}
    >
      <span className="pointer-events-none absolute right-0 top-7 z-10 whitespace-nowrap rounded border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}
