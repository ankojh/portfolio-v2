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
        <div className="ui-card absolute left-[5%] top-[120px] w-[41%] p-3.5">
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
        <div className="ui-card absolute right-[5%] top-[214px] w-[41%] p-3.5">
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
      <div aria-hidden="true">
        <div className="flex h-[30px] items-center gap-1.5 border-b border-[#EFE7DA] px-3">
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="size-2 rounded-full bg-[#E0D6C7]" />
          <span className="ml-3 truncate text-[11px] text-quiet">Kano model — lecture notes</span>
        </div>
        <div className="flex gap-3.5 p-3.5">
          <div className="relative flex-[1.6] rounded-lg border-[1.5px] border-ink p-3">
            <span className="absolute -top-[9px] left-2.5 rounded bg-ink px-1.5 py-0.5 text-[10px] text-ground">1 · kept</span>
            <div className="text-[12.5px] font-semibold">Must-be vs. delighter features</div>
            <div className="mt-2.5">
              <SkeletonLines widths={tall ? ["95%", "88%", "92%", "70%", "84%", "76%", "90%"] : ["95%", "88%", "92%", "70%", "84%"]} />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2.5">
            <BlurredRegion score="2 · 0.84" colors={["#C9A27A", "#9AA7B8"]} height={tall ? "h-[78px]" : "h-[62px]"} />
            <BlurredRegion score="3 · 0.71" colors={["#B8879A", "#D9B98C"]} height={tall ? "h-[78px]" : "h-[62px]"} />
            <div className="flex h-10 items-center rounded-lg border-[1.5px] border-ink px-2.5 text-[11px] text-body">⌕ Search notes</div>
          </div>
        </div>
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

export function CouncilCard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" role="img" aria-label="Illustration: the Meridian Council's emergency session, offering to rule for either island or seek middle ground.">
      <div aria-hidden="true" className="ui-card w-[84%] p-4 sm:w-[76%]">
        <div className="label text-[10px]">Meridian Council · emergency session</div>
        <div className="mt-1.5 font-serif text-[17px]">Review the matter</div>
        <div className="mt-3 flex gap-1.5">
          <span className="flex-1 rounded-[7px] border border-[#CDBDA5] px-1 py-2 text-center text-[11.5px]">Rule for Aurelia</span>
          <span className="flex-1 rounded-[7px] bg-ink px-1 py-2 text-center text-[11.5px] text-ground">Middle ground</span>
          <span className="flex-1 rounded-[7px] border border-[#CDBDA5] px-1 py-2 text-center text-[11.5px]">Rule for Korsav</span>
        </div>
        <div className="mt-3 text-[11px] text-quiet">Commanders choose only from legal moves: fortify · open_talks · hold …</div>
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

const workflowVisuals = {
  "offer-flow": { label: "Offer letter builder", headline: "From terms to a real offer.", steps: ["Set the terms", "Prepare the letter", "Send the offer"], note: "One complete hiring workflow", accent: "offer" },
  "comms-flow": { label: "Communications Hub", headline: "Give every update its context.", steps: ["Company data", "Investor update", "Shared context"], note: "Connected information → clearer communication", accent: "comms" },
  "physician-flow": { label: "Collaborating Physicians", headline: "A relationship the product understands.", steps: ["Physician", "Supervision", "Nurse practitioners"], note: "One physician · multiple practitioners", accent: "physician" },
  "credential-flow": { label: "Credentialing", headline: "Carry the data. Improve the process.", steps: ["Existing records", "Migration", "Credentialing"], note: "Data continuity, through a workflow change", accent: "credential" },
  "onboarding-flow": { label: "Inside the Mochi portal", headline: "A better place to begin.", steps: ["Provider details", "Data collection", "Credentialing steps"], note: "Previously outside the portal → now inside", accent: "onboarding" },
};

function WorkflowOverview({ kind }: { kind: keyof typeof workflowVisuals }) {
  const flow = workflowVisuals[kind];
  return <div className={`product-flow product-flow--${flow.accent}`} role="img" aria-label={`Conceptual ${flow.label} workflow: ${flow.steps.join(" to ")}.`}>
    <div aria-hidden="true"><p className="flow-label">{flow.label}</p><h3>{flow.headline}</h3>
      <div className="flow-stages">{flow.steps.map((step, index) => <div key={step}><span className="flow-step-number">0{index + 1}</span><span>{step}</span></div>)}</div>
      <p className="flow-note">{flow.note}</p>
    </div>
  </div>;
}

function FocusPlayVisual() {
  return <div className="focus-play-visual" role="img" aria-label="Conceptual Focus Play lesson: a learning goal and time budget become short narrated lessons, with source captions and practice questions.">
    <div aria-hidden="true"><div className="focus-play-heading"><span>Focus Play</span><span>Goal → lesson</span></div>
      <p>Less searching.<br /><em>More understanding.</em></p>
      <div className="focus-play-track"><span><Play size={15} fill="currentColor" /></span><div><strong>A lesson around your goal</strong><small>Source captions · narration · practice</small></div></div>
      <div className="focus-play-timeline"><span /><span /><span /><span /></div>
      <div className="focus-play-foot"><span>Your time budget</span><span>Sources stay in view ↗</span></div>
    </div>
  </div>;
}

/** Renders a visual by key inside a sandstone panel of a given height. */
export function VisualPanel({ visual, className }: { visual: VisualKey; className?: string }) {
  switch (visual) {
    case "offer-flow":
    case "comms-flow":
    case "physician-flow":
    case "credential-flow":
    case "onboarding-flow":
      return <WorkflowOverview kind={visual} />;
    case "focus-play":
      return <FocusPlayVisual />;
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
      return <CouncilCard />;
    case "ask-sample":
      return <AskSample />;
    case "ask-decline":
      return <AskDecline />;
  }
}
