import { Pause, Play } from "lucide-react";

import type { VisualKey } from "@/content/site";
import { cn } from "@/lib/utils";

/*
 * Illustrative product visuals. They are reconstructions that explain the
 * product idea, not screenshots of production software; every placement on the
 * site carries a caption saying so. Purely decorative content is aria-hidden;
 * each visual exposes one short accessible description instead.
 */

function SkeletonLines({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-[7px]">
      {widths.map((width, index) => (
        <div key={index} className="skeleton-line" style={{ width }} />
      ))}
    </div>
  );
}

function StageBar({ done, current }: { done: number; current: boolean }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1 w-[18px] rounded-sm",
            index < done ? "bg-ink" : index === done && current ? "bg-terra" : "bg-[#E6DCCB]",
          )}
        />
      ))}
    </div>
  );
}

const valuations = [
  { initials: "NL", tint: "bg-[#EFE3D1] text-[#6E4A2E]", name: "Northwind Labs", kind: "409A · Series A", done: 2, current: true, stage: "Analyst model" },
  { initials: "HB", tint: "bg-[#E4E6DA] text-[#4D5240]", name: "Halden Bio", kind: "409A · Seed", done: 3, current: true, stage: "In review" },
  { initials: "LK", tint: "bg-[#E9E1EC] text-[#5A4763]", name: "Larkspur", kind: "Token valuation", done: 5, current: false, stage: "Report delivered" },
];

export function ValuationTracker({ compact = false, className }: { compact?: boolean; className?: string }) {
  const rows = compact ? valuations.slice(0, 2) : valuations;
  return (
    <div className={cn("ui-card p-[18px] pb-3.5", className)} role="img" aria-label="Illustration: a valuation queue tracking each request through intake, modeling, review and report.">
      <div aria-hidden="true">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Valuations</div>
          <div className="flex gap-1 text-[11.5px] text-quiet">
            <span className="rounded-full bg-ink px-[9px] py-[5px] text-ground">Queue · 12</span>
            {!compact && <span className="rounded-full bg-[#F3ECE1] px-[9px] py-[5px]">In review · 4</span>}
          </div>
        </div>
        <div className="mt-3.5">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center gap-3 border-t border-[#F0E8DC] py-[11px]">
              <div className={cn("flex size-7 items-center justify-center rounded-[7px] text-[11px] font-semibold", row.tint)}>{row.initials}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold">{row.name}</div>
                <div className="text-[11.5px] text-quiet">{row.kind}</div>
              </div>
              <div className="flex flex-col items-end gap-[5px]">
                <StageBar done={row.done} current={row.current} />
                {!compact && <div className="text-[11px] text-quiet">{row.stage}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-2 border-t border-[#E8DECF] pt-3">
          <span className="label text-[10.5px]">Turnaround</span>
          <span className="font-serif text-lg">days → about 2 hours</span>
        </div>
      </div>
    </div>
  );
}

export function ValuationReview() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: structured valuation inputs next to a report waiting for review and approval.">
      <div aria-hidden="true">
        <div className="ui-card absolute left-[5%] top-[7%] w-[41%] p-3.5">
          <div className="label text-[10.5px]">Inputs</div>
          <dl className="mt-3 flex flex-col gap-[9px] text-xs">
            {[
              ["Valuation date", "Mar 31"],
              ["Latest round", "Series A"],
              ["Cap table", "✓ Synced"],
              ["Comparables", "8 companies"],
            ].map(([key, value], index, all) => (
              <div key={key} className={cn("flex justify-between gap-2", index < all.length - 1 && "border-b border-[#F0E8DC] pb-2")}>
                <dt className="text-quiet">{key}</dt>
                <dd className={cn("font-semibold", value.startsWith("✓") && "text-[#3F6A4A]")}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="ui-card absolute bottom-[7%] right-[5%] w-[41%] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold">Valuation report</span>
            <span className="rounded-full bg-terra-soft px-2 py-1 text-[11px] text-[#8A3A1C]">In review</span>
          </div>
          <div className="mt-3.5">
            <SkeletonLines widths={["92%", "78%", "85%", "60%"]} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex">
              <span className="flex size-[22px] items-center justify-center rounded-full border-2 border-white bg-[#E7D3BF] text-[9px] font-semibold">JS</span>
              <span className="-ml-1.5 flex size-[22px] items-center justify-center rounded-full border-2 border-white bg-[#D8DCCB] text-[9px] font-semibold">MR</span>
            </div>
            <span className="rounded-[7px] bg-ink px-[11px] py-[7px] text-[11.5px] font-semibold text-ground">Approve</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LicenseStates() {
  return (
    <div className="flex w-full flex-col items-center gap-[18px]" role="img" aria-label="Illustration: a license moving from active to expiring to expired, with the change marked as reversible.">
      <div aria-hidden="true" className="flex w-full flex-col items-center gap-[18px]">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[12.5px] font-semibold sm:gap-2.5 sm:text-[13px]">
          <span className="rounded-full border border-[#E0D4C1] bg-white px-3 py-2 sm:px-3.5 sm:py-[9px]">Active</span>
          <span className="text-[#8C7E6E]">→</span>
          <span className="rounded-full border border-[#E0D4C1] bg-white px-3 py-2 sm:px-3.5 sm:py-[9px]">Expiring soon</span>
          <span className="text-[#8C7E6E]">→</span>
          <span className="rounded-full bg-ink px-3 py-2 text-ground sm:px-3.5 sm:py-[9px]">Expired</span>
        </div>
        <div className="ui-card flex w-full max-w-[380px] items-center justify-between gap-3 px-4 py-3.5">
          <div>
            <div className="text-[12.5px] font-semibold">Status changed to Expired</div>
            <div className="mt-[3px] text-[11.5px] text-quiet">Today, 9:14 AM · can be reverted</div>
          </div>
          <span className="whitespace-nowrap rounded-[7px] border border-[#CDBDA5] px-3 py-2 text-[11.5px] font-semibold">↺ Revert</span>
        </div>
      </div>
    </div>
  );
}

function BlurredRegion({ score, colors, height = "h-[62px]" }: { score?: string; colors: [string, string]; height?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border-[1.5px] border-dashed border-terra", height)}>
      <div className="flex flex-col gap-1.5 p-2.5 blur-[5px]">
        <div className="h-[9px] w-4/5 rounded" style={{ background: colors[0] }} />
        <div className="h-[9px] w-3/5 rounded" style={{ background: colors[1] }} />
      </div>
      {score && <span className="absolute right-1 top-1 rounded bg-terra px-1.5 py-0.5 text-[10px] text-white">{score}</span>}
    </div>
  );
}

export function HeadsDownMini({ tall = false }: { tall?: boolean }) {
  return (
    <div className="ui-card absolute inset-x-7 bottom-[-14px] top-7 overflow-hidden" role="img" aria-label="Illustration: lecture notes stay visible while two off-task panels beside them are blurred.">
      <div aria-hidden="true" className={cn(tall && "flex h-full flex-col pb-[34px]")}>
        <div className="flex h-[30px] shrink-0 items-center gap-1.5 border-b border-[#EFE7DA] px-3">
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="ml-3 truncate text-[11px] text-quiet">Kano model — lecture notes</span>
        </div>
        <div className={cn("flex gap-3.5 p-3.5", tall && "min-h-0 flex-1")}>
          <div className="relative flex-[1.6] rounded-lg border-[1.5px] border-ink p-3">
            <span className="absolute -top-[9px] left-2.5 rounded bg-ink px-1.5 py-0.5 text-[10px] text-ground">1 · kept</span>
            <div className="text-[12.5px] font-semibold">Must-be vs. delighter features</div>
            <div className="mt-2.5">
              <SkeletonLines widths={tall ? ["95%", "88%", "92%", "70%", "84%", "76%", "90%"] : ["95%", "88%", "92%", "70%", "84%"]} />
            </div>
            {tall && (
              <>
                <div className="mt-5 text-[12.5px] font-semibold">Performance features</div>
                <div className="mt-2.5">
                  <SkeletonLines widths={["90%", "82%", "94%", "66%"]} />
                </div>
                <div className="mt-5 flex items-end gap-2 rounded-md bg-[#F5EFE6] p-3">
                  {[30, 55, 80].map((height, index) => (
                    <span key={height} className={cn("w-6 rounded-t-[3px]", index === 2 ? "bg-terra" : "bg-[#D9C7B5]")} style={{ height }} />
                  ))}
                  <span className="ml-2 text-[11px] text-quiet">Satisfaction by category</span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2.5">
            <BlurredRegion score="2 · 0.84" colors={["#C9A27A", "#9AA7B8"]} height={tall ? "h-[78px]" : "h-[62px]"} />
            <BlurredRegion score="3 · 0.71" colors={["#B8879A", "#D9B98C"]} height={tall ? "h-[78px]" : "h-[62px]"} />
            {tall && <BlurredRegion score="4 · 0.66" colors={["#A9B79A", "#C9A27A"]} height="h-[78px]" />}
            <div className="mt-auto flex h-10 shrink-0 items-center rounded-lg border-[1.5px] border-ink px-2.5 text-[11px] text-body">⌕ Search notes</div>
          </div>
        </div>
        {tall && (
          <div className="mx-3.5 flex shrink-0 items-center justify-between gap-3 rounded-[10px] border border-[#E4D9C7] bg-[#FBF8F3] px-3.5 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12.5px] font-semibold">
                Heads Down
                <span className="rounded-full bg-terra-soft px-2 py-0.5 text-[10.5px] font-normal text-[#8A3A1C]">● Focusing</span>
              </div>
              <div className="mt-1 truncate text-[11.5px] text-quiet">Task: studying the Kano model · 2 regions hidden</div>
            </div>
            <span className="shrink-0 rounded-[7px] border border-[#CDBDA5] px-2.5 py-1.5 font-mono text-[10.5px]">⌃⌥⌘R reveal</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeadsDownWindow() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: a lecture video stays visible because it matches the task, recommendations beside it are blurred, and the Heads Down panel shows the task, hiding level and pause options.">
      <div aria-hidden="true">
        <div className="ui-card absolute bottom-[-20px] left-[6%] right-[6%] top-[150px] overflow-hidden md:right-[30%]">
          <div className="flex h-10 items-center gap-[7px] border-b border-[#EFE7DA] px-4">
            <span className="size-2.5 rounded-full bg-[#E0D6C7]" />
            <span className="size-2.5 rounded-full bg-[#E0D6C7]" />
            <span className="size-2.5 rounded-full bg-[#E0D6C7]" />
            <span className="ml-4 flex h-6 max-w-[360px] flex-1 items-center truncate rounded-md bg-[#F5EFE6] px-2.5 text-xs text-quiet">video.example · Kano model explained</span>
          </div>
          <div className="flex gap-5 p-5">
            <div className="flex flex-[1.7] flex-col gap-3.5">
              <div className="relative flex h-[190px] items-center justify-center rounded-[10px] bg-[#2B2622]">
                <span className="flex size-[52px] items-center justify-center rounded-full bg-ground/90">
                  <Play className="ml-0.5 size-5 fill-ink text-ink" />
                </span>
                <span className="absolute bottom-2.5 left-3 text-[11px] text-stone">Lecture · 8:02</span>
              </div>
              <div className="text-base font-semibold">Kano Model Explained: must-be, performance and delighters</div>
              <SkeletonLines widths={["96%", "88%", "70%"]} />
            </div>
            <div className="hidden flex-1 flex-col gap-3 sm:flex">
              <div className="flex h-[30px] items-center rounded-lg border border-[#DCD2C3] px-2.5 text-[11.5px] text-body">⌕ Search</div>
              {[
                ["#D7A27A", "#8E9BB0", "#C69AA8"],
                ["#9DB39A", "#D9B98C", "#A79BC3"],
                ["#C98E86", "#94A6B9", "#DDBF92"],
              ].map(([thumb, line1, line2]) => (
                <div key={thumb} className="h-[74px] overflow-hidden rounded-lg bg-[#F3EBDF]">
                  <div className="flex gap-2 p-2.5 blur-[6px]">
                    <span className="h-[54px] w-14 rounded-md" style={{ background: thumb }} />
                    <span className="flex flex-1 flex-col gap-1.5">
                      <span className="h-[9px] rounded" style={{ background: line1 }} />
                      <span className="h-[9px] w-[70%] rounded" style={{ background: line2 }} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ui-card absolute right-[6%] top-[112px] hidden w-[290px] rounded-[14px] p-[18px] md:block">
          <HeadsDownPanelBody />
        </div>
      </div>
    </div>
  );
}

export function HeadsDownPanelBody() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Heads Down</span>
        <span className="rounded-full bg-terra-soft px-[9px] py-1 text-[11.5px] text-[#8A3A1C]">● Focusing</span>
      </div>
      <div className="label mt-4 text-[10.5px]">Task</div>
      <div className="mt-1.5 rounded-[9px] border border-[#DCD2C3] px-3 py-2.5 text-[13px] leading-snug">Studying the Kano model for my product class</div>
      <div className="label mt-4 text-[10.5px]">Hiding level</div>
      <div className="mt-1.5 flex rounded-[9px] bg-[#F3ECE1] p-[3px] text-xs">
        <span className="flex-1 py-[7px] text-center text-body">Relaxed</span>
        <span className="flex-1 rounded-[7px] bg-white py-[7px] text-center font-semibold shadow-sm">Balanced</span>
        <span className="flex-1 py-[7px] text-center text-body">Strict</span>
      </div>
      <div className="mt-4 flex gap-1.5">
        <span className="flex-1 rounded-lg border border-[#CDBDA5] py-[9px] text-center text-xs font-semibold">Pause 2 min</span>
        <span className="flex-1 rounded-lg border border-[#CDBDA5] py-[9px] text-center text-xs font-semibold">Pause 3 min</span>
      </div>
      <div className="mt-3.5 text-xs leading-normal text-quiet">
        Reveal one region for 10 min: ⌃⌥⌘R
        <br />
        Pause until resumed: ⌃⌥⌘P
      </div>
    </>
  );
}

function CheckDot({ state }: { state: "done" | "current" | "todo" }) {
  if (state === "done") {
    return <span className="flex size-4 items-center justify-center rounded-full bg-ink text-[10px] text-ground">✓</span>;
  }
  return (
    <span
      className={cn(
        "size-4 rounded-full border-solid",
        state === "current" ? "border-2 border-terra" : "border-[1.5px] border-[#B9AA94]",
      )}
    />
  );
}

function RunPlan() {
  return (
    <div className="absolute left-[22px] top-[26px] flex w-[40%] flex-col gap-2.5 text-xs">
      <div className="label text-[10px]">Run plan</div>
      <div className="flex items-center gap-2"><CheckDot state="done" />Read the parser</div>
      <div className="flex items-center gap-2"><CheckDot state="done" />Patch edge case</div>
      <div className="flex items-center gap-2 font-semibold"><CheckDot state="current" />Verify with evidence</div>
      <div className="flex items-center gap-2 text-quiet"><CheckDot state="todo" />Complete</div>
    </div>
  );
}

export function TffApproval() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: an agent's run plan waiting on verification, and an approval card for a sandboxed test command.">
      <div aria-hidden="true">
        <RunPlan />
        <div className="ui-card absolute right-5 top-[26px] w-1/2 p-3.5">
          <div className="label text-[10px] text-[#8A3A1C]">Approval needed</div>
          <div className="mt-2 rounded-md bg-[#F5EFE6] p-2 font-mono text-[11.5px]">run_command  pytest -q</div>
          <div className="mt-2 text-[11px] text-quiet">Sandboxed · no network · 30 s limit</div>
          <div className="mt-3 flex gap-1.5">
            <span className="flex-1 rounded-[7px] bg-ink p-[7px] text-center text-[11.5px] font-semibold text-ground">Approve</span>
            <span className="flex-1 rounded-[7px] border border-[#CDBDA5] p-[7px] text-center text-[11.5px] font-semibold">Deny</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TffReview() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: reviewing an agent worker's code changes hunk by hunk before integrating them.">
      <div aria-hidden="true">
        <RunPlan />
        <div className="ui-card absolute right-5 top-[22px] w-1/2 p-3.5">
          <div className="label text-[10px] text-[#8A3A1C]">Review worker changes</div>
          <div className="mt-2 rounded-md bg-[#F5EFE6] p-2 font-mono text-[11px] leading-relaxed">
            <div className="text-[#8A3A1C]">- return None</div>
            <div className="text-[#2F5D3A]">+ return default</div>
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5 text-[11.5px]">
            <span>☑ Hunk 1 · parser.py</span>
            <span className="text-quiet">☐ Hunk 2 · utils.py</span>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            <span className="flex-1 rounded-[7px] bg-ink p-[7px] text-center text-[11.5px] font-semibold text-ground">Integrate 1</span>
            <span className="flex-1 rounded-[7px] border border-[#CDBDA5] p-[7px] text-center text-[11.5px] font-semibold">Discard</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HushPlayer() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: a passage being read aloud with the current three words highlighted and a compact player showing voice and speed.">
      <div aria-hidden="true">
        <p className="absolute inset-x-[26px] top-7 text-sm leading-[1.75] text-quiet">
          The Kano model sorts features by how they affect satisfaction.{" "}
          <span className="rounded bg-[#F3D3BF] px-[3px] py-px text-ink">Must-be features go</span> unnoticed when present but
          cause frustration when missing.
        </p>
        <div className="ui-card absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full py-[9px] pl-[9px] pr-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-ink">
            <Pause className="size-3 fill-ground text-ground" />
          </span>
          <span className="text-xs font-semibold">Heart</span>
          <span className="rounded-full bg-[#F3ECE1] px-2 py-1 text-xs">1.25×</span>
          <span className="hidden text-[11.5px] text-quiet min-[400px]:inline">Waiting for new text…</span>
        </div>
      </div>
    </div>
  );
}

function ChatSample({ question, answer, sources }: { question: string; answer: string; sources?: string[] }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col gap-2.5 px-[26px] py-6">
      <div className="self-end rounded-[14px_14px_4px_14px] bg-ink px-[13px] py-[9px] text-[12.5px] text-ground">{question}</div>
      <div className="ui-card max-w-[86%] self-start rounded-[14px_14px_14px_4px] px-3.5 py-3 text-[12.5px] leading-[1.55]">
        {answer}
        {sources && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((source) => (
              <span key={source} className="rounded-[5px] bg-[#F3ECE1] px-[7px] py-[3px] text-[10.5px] text-[#6B4A33]">{source}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AskSample() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: Ask Ankit answering a question about Pulley, citing its source notes.">
      <ChatSample
        question="What did Ankit own at Pulley?"
        answer="He owned the Communications Hub from concept through launch, built V1 of the Offer Letter Builder as sole engineer, and led the analyst-tooling initiative for the Valuation Platform."
        sources={["pulley_experience.md", "resume_source_of_truth.md"]}
      />
    </div>
  );
}

export function AskDecline() {
  return (
    <div className="absolute inset-0" role="img" aria-label="Illustration: Ask Ankit declining an off-topic question and suggesting a relevant one.">
      <ChatSample
        question="What’s the weather in Paris?"
        answer="I only answer questions about Ankit’s work, projects and background. Try: “What did he build at Pulley?”"
      />
    </div>
  );
}

/*
 * Visuals sit in panels from ~320px to ~560px wide. `vis-root` makes the
 * panel a size container; `vis-wide` content only appears when there is room.
 */

function FieldRows({ rows, className }: { rows: Array<[string, string]>; className?: string }) {
  return (
    <dl className={cn("flex flex-col gap-2 text-[11.5px]", className)}>
      {rows.map(([key, value], index) => (
        <div key={key} className={cn("flex justify-between gap-2", index < rows.length - 1 && "border-b border-[#F0E8DC] pb-[7px]")}>
          <dt className="text-quiet">{key}</dt>
          <dd className="text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Merge({ children }: { children: string }) {
  return <span className="rounded-[3px] bg-terra-soft px-1 text-[#8A3A1C]">{children}</span>;
}

export function OfferBuilder() {
  return (
    <div className="vis-root absolute inset-0 flex items-center justify-center gap-3 p-5" role="img" aria-label="Illustration: offer terms on the left fill a letter preview on the right, ready to send to the candidate.">
      <div aria-hidden="true" className="contents">
        <div className="ui-card w-[44%] max-w-[220px] shrink-0 p-3.5">
          <div className="label text-[10px]">Offer terms</div>
          <FieldRows
            className="mt-3"
            rows={[
              ["Role", "Designer"],
              ["Base", "$145,000"],
              ["Equity", "4,000 options"],
              ["Vesting", "4 yr · 1 yr cliff"],
            ]}
          />
        </div>
        <div className="ui-card flex min-w-0 max-w-[250px] flex-1 flex-col p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[12.5px] font-semibold">Offer letter</span>
            <span className="vis-wide shrink-0 rounded-full bg-[#E4E6DA] px-2 py-0.5 text-[10.5px] text-[#4D5240]">Ready</span>
          </div>
          <p className="mt-2.5 text-[11px] leading-[1.6] text-body">
            Dear Priya, we’re delighted to offer you the role of <Merge>Designer</Merge> with <Merge>4,000 options</Merge>.
          </p>
          <div className="mt-2.5">
            <SkeletonLines widths={["94%", "80%"]} />
          </div>
          <span className="mt-3 self-end rounded-[7px] bg-ink px-[11px] py-[7px] text-[11.5px] font-semibold text-ground">Send offer</span>
        </div>
      </div>
    </div>
  );
}

const revenueBars = [38, 46, 44, 58, 64, 72];

export function CommsUpdate() {
  return (
    <div className="vis-root absolute inset-0 flex items-center justify-center p-5" role="img" aria-label="Illustration: an investor update being written inside the product, with a chart pulled live from company data and the investor list attached.">
      <div aria-hidden="true" className="ui-card w-full max-w-[430px] p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold">Q3 investor update</span>
          <span className="rounded-full bg-[#F3ECE1] px-2 py-0.5 text-[10.5px] text-quiet">Draft</span>
        </div>
        <div className="mt-3 flex gap-3">
          <div className="vis-wide flex-1 pt-1">
            <SkeletonLines widths={["96%", "88%", "92%", "64%"]} />
          </div>
          <div className="min-w-0 flex-1 rounded-lg border border-[#E8DECF] bg-[#FBF8F3] p-2.5">
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className="font-semibold">Monthly revenue</span>
              <span className="text-[#3F6A4A]">● Live data</span>
            </div>
            <div className="mt-2 flex h-[46px] items-end gap-[5px]">
              {revenueBars.map((height, index) => (
                <span key={index} className={cn("flex-1 rounded-t-[3px]", index === revenueBars.length - 1 ? "bg-terra" : "bg-[#D9C7B5]")} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#F0E8DC] pt-3">
          <div className="flex items-center">
            {["#E7D3BF", "#D8DCCB", "#E2D4E6"].map((tint, index) => (
              <span key={tint} className={cn("size-[22px] rounded-full border-2 border-white", index > 0 && "-ml-1.5")} style={{ background: tint }} />
            ))}
            <span className="ml-2 text-[11px] text-quiet">24 investors</span>
          </div>
          <span className="rounded-[7px] bg-ink px-[11px] py-[7px] text-[11.5px] font-semibold text-ground">Share update</span>
        </div>
      </div>
    </div>
  );
}

const practitioners = [
  { initials: "JO", name: "J. Ortiz", state: "TX", position: "left-[5%] top-[12%]", pending: false },
  { initials: "LK", name: "L. Kim", state: "FL", position: "right-[5%] top-[12%]", pending: false },
  { initials: "SB", name: "S. Bello", state: "AZ", position: "left-[5%] bottom-[12%]", pending: false },
  { initials: "RN", name: "R. Nair", state: "CO", position: "right-[5%] bottom-[12%]", pending: true },
];

export function PhysicianNetwork() {
  return (
    <div className="vis-root absolute inset-0" role="img" aria-label="Illustration: one collaborating physician connected to four nurse practitioners in different states, with one supervision agreement pending.">
      <div aria-hidden="true">
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[[22, 22], [78, 22], [22, 78], [78, 78]].map(([x, y]) => (
            <line key={`${x}-${y}`} x1="50" y1="50" x2={x} y2={y} stroke="#B9AA94" strokeWidth="1.25" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="ui-card absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 px-3.5 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-ground">AM</span>
          <span>
            <span className="block whitespace-nowrap text-[12.5px] font-semibold">Dr. A. Mensah</span>
            <span className="block whitespace-nowrap text-[10.5px] text-quiet">Collaborating physician</span>
          </span>
        </div>
        {practitioners.map((np) => (
          <div key={np.name} className={cn("ui-card absolute flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 shadow-none", np.position)}>
            <span className="flex size-6 items-center justify-center rounded-full bg-[#E9E1EC] text-[9.5px] font-semibold text-[#5A4763]">{np.initials}</span>
            <span className="whitespace-nowrap text-[11px]">
              <span className="font-semibold">NP · {np.state}</span>
              <span className={cn("ml-1.5", np.pending ? "text-terra" : "text-[#3F6A4A]")}>{np.pending ? "Pending" : "✓"}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const credentialChecks: Array<[string, "done" | "current"]> = [
  ["State license", "done"],
  ["DEA registration", "done"],
  ["Board certification", "done"],
  ["Payer enrollment", "current"],
];

export function CredentialMigration() {
  return (
    <div className="vis-root absolute inset-0 flex flex-col justify-center gap-3.5 px-5 py-4" role="img" aria-label="Illustration: legacy provider records migrating into a structured credentialing file, with verified items checked and payer enrollment in progress.">
      <div aria-hidden="true" className="contents">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-[34%] max-w-[150px] shrink-0 rounded-lg border border-dashed border-[#CDBDA5] bg-[#F7F1E8] p-2.5">
            <div className="label text-[9.5px]">Legacy records</div>
            <div className="mt-2 flex flex-col gap-[7px]">
              {["#E7DED0", "#E7DED0", "#F0C9B4", "#E7DED0"].map((tint, index) => (
                <div key={index} className="flex gap-1">
                  <span className="h-[7px] w-1/3 rounded-sm" style={{ background: tint }} />
                  <span className="h-[7px] flex-1 rounded-sm" style={{ background: tint }} />
                </div>
              ))}
            </div>
          </div>
          <span className="shrink-0 text-[#8C7E6E]">→</span>
          <div className="ui-card min-w-0 max-w-[230px] flex-1 p-3">
            <div className="truncate text-[12px] font-semibold">Provider file · Dr. K. Iyer</div>
            <div className="mt-2.5 flex flex-col gap-[7px] text-[11px]">
              {credentialChecks.map(([item, state]) => (
                <div key={item} className={cn("flex items-center gap-2", state === "current" && "font-semibold")}>
                  <CheckDot state={state} />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[400px]">
          <div className="flex justify-between gap-2 text-[10.5px] text-quiet">
            <span>Migrating records</span>
            <span>Validated on import</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E6DCCB]">
            <div className="h-full w-[72%] rounded-full bg-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}

const onboardingSteps: Array<[string, "done" | "current" | "todo"]> = [
  ["Profile", "done"],
  ["Licenses", "done"],
  ["Credentialing", "current"],
  ["Review", "todo"],
];

export function OnboardingPortal() {
  return (
    <div className="vis-root ui-card absolute inset-x-[6%] bottom-[-14px] top-6 overflow-hidden" role="img" aria-label="Illustration: provider onboarding inside the Mochi portal, with profile and licenses complete and credentialing documents being collected.">
      <div aria-hidden="true">
        <div className="flex h-[30px] items-center gap-1.5 border-b border-[#EFE7DA] px-3">
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="ml-3 truncate text-[11px] text-quiet">Provider portal · Onboarding</span>
        </div>
        <div className="flex gap-4 p-3.5">
          <div className="flex w-[36%] max-w-[140px] shrink-0 flex-col gap-2.5 text-[11.5px]">
            {onboardingSteps.map(([step, state]) => (
              <div key={step} className={cn("flex items-center gap-2", state === "current" && "font-semibold", state === "todo" && "text-quiet")}>
                <CheckDot state={state} />
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1 border-l border-[#F0E8DC] pl-4">
            <div className="text-[12.5px] font-semibold">Credentialing documents</div>
            <div className="label mt-2.5 text-[9.5px]">NPI number</div>
            <div className="mt-1 rounded-md border border-[#DCD2C3] px-2.5 py-1.5 text-[11.5px]">1093 •••• 21</div>
            <div className="label mt-2.5 text-[9.5px]">Board certificate</div>
            <div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-[#F5EFE6] px-2.5 py-1.5 text-[11.5px]">
              <span className="truncate">board-cert.pdf</span>
              <span className="text-[#3F6A4A]">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const lessonSegments = [
  { state: "played", flex: "flex-[1.1]" },
  { state: "playing", flex: "flex-[1.3]" },
  { state: "ready", flex: "flex-1" },
  { state: "preparing", flex: "flex-[0.9]" },
];

export function FocusPlayLesson() {
  return (
    <div className="vis-root absolute inset-0 flex flex-col justify-center gap-3 bg-[#442C3E] px-5 py-4 text-[#FFF6E9]" role="img" aria-label="Illustration: a Focus Play lesson on the Kano model, built to a 15-minute budget, with a narrated diagram, the source caption it came from and a practice question.">
      <div aria-hidden="true" className="contents">
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#E2C9D4]">
          <span className="truncate">Goal · understand the Kano model</span>
          <span className="shrink-0 rounded-full border border-[#866A7C] px-2 py-0.5">15 min</span>
        </div>
        <div className="flex gap-3">
          <div className="min-w-0 flex-1 rounded-lg bg-[#36222F] p-3">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 120 70" className="h-[64px] w-[110px] shrink-0">
                <line x1="60" y1="4" x2="60" y2="66" stroke="#866A7C" strokeWidth="1" />
                <line x1="6" y1="35" x2="114" y2="35" stroke="#866A7C" strokeWidth="1" />
                <path d="M8 64 Q 60 60 112 6" fill="none" stroke="#F0BC93" strokeWidth="2" />
                <path d="M8 62 L 112 8" fill="none" stroke="#DDC6D0" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M8 64 Q 60 10 112 6" fill="none" stroke="#866A7C" strokeWidth="1.5" />
              </svg>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold">
                  <Play className="size-3 fill-current" /> Short 2 · Delighters
                </span>
                <span className="mt-1.5 block text-[10.5px] leading-snug text-[#DDC6D0]">“…features customers don’t expect, but love…”</span>
              </span>
            </div>
            <div className="mt-2.5 truncate font-mono text-[9.5px] text-[#F0BC93]">Source · lecture captions 04:12 ↗</div>
          </div>
          <div className="vis-wide w-[36%] shrink-0 rounded-lg border border-[#866A7C] p-3">
            <div className="font-mono text-[9.5px] text-[#E2C9D4]">Practice</div>
            <div className="mt-1.5 text-[11.5px] leading-snug">Hotel Wi-Fi is which kind of feature?</div>
            <div className="mt-2 flex flex-col gap-1 text-[10.5px]">
              <span className="rounded bg-[#FFF6E9] px-2 py-1 text-ink">Must-be</span>
              <span className="rounded border border-[#866A7C] px-2 py-1">Delighter</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-[5px]">
            {lessonSegments.map((segment) => (
              <span
                key={segment.state}
                className={cn(
                  "h-1 rounded-full",
                  segment.flex,
                  segment.state === "played" && "bg-[#F0BC93]",
                  segment.state === "playing" && "bg-gradient-to-r from-[#F0BC93] from-40% to-[#866A7C] to-40%",
                  segment.state === "ready" && "bg-[#866A7C]",
                  segment.state === "preparing" && "border border-dashed border-[#866A7C]",
                )}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between gap-2 font-mono text-[9.5px] text-[#DDC6D0]">
            <span>4 shorts · fits your budget</span>
            <span className="vis-wide">next one preparing…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoveChip({ x, y, label }: { x: number; y: number; label: string }) {
  const width = label.length * 6.2 + 18;
  return (
    <g transform={`translate(${x - width / 2} ${y})`}>
      <rect width={width} height="18" rx="9" fill="#FFFDFA" stroke="#CDBDA5" />
      <text x={width / 2} y="12.5" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, Menlo, monospace" fill="#382833">{label}</text>
    </g>
  );
}

export function CouncilMap() {
  return (
    <div className="vis-root absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#E6E4DA] p-4" role="img" aria-label="Illustration: the rival islands of Aurelia and Korsav across a contested strait, each commander choosing a legal move, while the Meridian Council chooses how to respond.">
      <div aria-hidden="true" className="contents">
        <svg viewBox="0 0 400 130" className="h-auto max-h-[150px] w-full max-w-[460px]">
          <path d="M18 92 C 10 58, 44 34, 86 38 C 120 41, 146 30, 160 58 C 172 82, 146 112, 104 112 C 66 114, 24 116, 18 92 Z" fill="#D9C7A8" stroke="#B9A07C" />
          <path d="M248 60 C 258 28, 304 22, 340 34 C 376 46, 392 74, 372 98 C 352 120, 298 118, 270 104 C 246 92, 242 76, 248 60 Z" fill="#CBBFA6" stroke="#A8987A" />
          <path d="M164 74 C 196 66, 220 78, 246 72" fill="none" stroke="#8A3A1C" strokeWidth="1.5" strokeDasharray="5 4" />
          <circle cx="205" cy="72" r="5" fill="#A4452D" />
          <text x="205" y="94" textAnchor="middle" fontSize="9" fontFamily="ui-monospace, Menlo, monospace" fill="#8A3A1C">contested strait</text>
          <text x="88" y="84" textAnchor="middle" fontSize="13" fontWeight="600" fill="#382833">Aurelia</text>
          <text x="312" y="80" textAnchor="middle" fontSize="13" fontWeight="600" fill="#382833">Korsav</text>
          <MoveChip x={88} y={6} label="fortify" />
          <MoveChip x={312} y={2} label="open_talks" />
        </svg>
        <div className="ui-card w-full max-w-[360px] px-3 py-2.5">
          <div className="label text-[9.5px]">Meridian Council · your call</div>
          <div className="mt-2 flex gap-1.5 text-[11px]">
            <span className="flex-1 truncate rounded-[7px] border border-[#CDBDA5] px-1 py-1.5 text-center">Aurelia</span>
            <span className="flex-1 truncate rounded-[7px] bg-ink px-1 py-1.5 text-center text-ground">Middle ground</span>
            <span className="flex-1 truncate rounded-[7px] border border-[#CDBDA5] px-1 py-1.5 text-center">Korsav</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Renders a visual by key inside a sandstone panel of a given height. */
export function VisualPanel({ visual, className }: { visual: VisualKey; className?: string }) {
  switch (visual) {
    case "offer-flow":
      return <OfferBuilder />;
    case "comms-flow":
      return <CommsUpdate />;
    case "physician-flow":
      return <PhysicianNetwork />;
    case "credential-flow":
      return <CredentialMigration />;
    case "onboarding-flow":
      return <OnboardingPortal />;
    case "focus-play":
      return <FocusPlayLesson />;
    case "valuation-review":
      return <ValuationReview />;
    case "license-states":
      return (
        <div className={cn("flex h-full items-center justify-center p-7", className)}>
          <LicenseStates />
        </div>
      );
    case "heads-down-mini":
      return <HeadsDownMini />;
    case "heads-down-window":
      return <HeadsDownWindow />;
    case "tff-approval":
      return <TffApproval />;
    case "tff-review":
      return <TffReview />;
    case "hush-player":
      return <HushPlayer />;
    case "council":
      return <CouncilMap />;
    case "ask-sample":
      return <AskSample />;
    case "ask-decline":
      return <AskDecline />;
  }
}
