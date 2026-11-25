import { Pause, Play } from "lucide-react";

import { HeadsDownDemo } from "@/components/visuals/HeadsDownDemo";
import { WorkIllustration } from "@/components/visuals/WorkIllustrations";
import { DorGlobe, TransformerAttention } from "@/components/visuals/NewProjectVisuals";
import { MotionScene } from "@/components/visuals/ProjectMotion";
import { SceneChoice, SceneNote } from "@/components/visuals/SceneControls";
import { useSceneChoice } from "@/components/visuals/sceneControl";
import type { VisualKey } from "@/content/site";
import { cn } from "@/lib/utils";

/*
 * Illustrative product visuals. They are reconstructions that explain the
 * product idea, not screenshots of production software; every placement on the
 * site carries a caption saying so. Purely decorative content is aria-hidden;
 * each visual exposes one short accessible description instead.
 */

/** The same before/after story is readable in a compact card or a large case-study panel. */
export function HeadsDownMini({ tall = false }: { tall?: boolean }) {
  return <HeadsDownDemo spacious={tall} />;
}

export function HeadsDownWindow() {
  return <HeadsDownDemo spacious />;
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
    <div className="scene-run-plan absolute left-[22px] top-[26px] flex w-[40%] flex-col gap-2.5 text-xs">
      <div className="label text-[10px]">Run plan</div>
      <div className="flex items-center gap-2"><CheckDot state="done" />Read the parser</div>
      <div className="flex items-center gap-2"><CheckDot state="done" />Patch edge case</div>
      <div className="flex items-center gap-2 font-semibold"><CheckDot state="current" />Verify with evidence</div>
      <div className="flex items-center gap-2 text-quiet"><CheckDot state="todo" />Complete</div>
    </div>
  );
}

/*
 * TFF grants autonomy per action, so the decision is the control. Approving records a
 * decision in the illustration; nothing runs here, and the harness still requires
 * evidence before a task can be called done.
 */
const decisions = {
  pending: { label: "Approval needed", note: "Sandboxed · no network · 30 s limit" },
  approved: { label: "Approved", note: "Allowed, this command only." },
  denied: { label: "Denied", note: "Nothing ran. It must retry." },
};

export function TffApproval() {
  const { value: decision, choose } = useSceneChoice<keyof typeof decisions>("pending");
  return (
    <div className="absolute inset-0">
      <p className="sr-only">
        Illustration: an agent’s run plan waiting on verification, beside an approval card for a sandboxed test
        command. You can approve or deny the command; the illustration records your decision and does not run
        anything.
      </p>
      <div aria-hidden="true"><RunPlan /></div>
      <div className="ui-card absolute right-5 top-[26px] w-1/2 p-3.5">
        <div aria-hidden="true">
          <div className="label text-[10px] text-[#8A3A1C]">{decisions[decision].label}</div>
          <div className="mt-2 rounded-md bg-[#F5EFE6] p-2 font-mono text-[11.5px]">run_command  pytest -q</div>
        </div>
        <SceneNote className="mt-2 text-[11px] leading-snug text-quiet">{decisions[decision].note}</SceneNote>
        {/* Both decisions stay fully legible whichever one is taken: the chosen one is
            filled, the other is an ordinary outline button, never a faded one. */}
        <div className="mt-3 flex gap-1.5" role="group" aria-label="Approve or deny this sandboxed command">
          <SceneChoice
            pressed={decision === "approved"}
            onClick={() => choose("approved")}
            className={cn("flex-1 rounded-[7px] p-[7px] text-center text-[11.5px] font-semibold", decision === "denied" ? "border border-[#CDBDA5] text-ink" : "bg-ink text-ground")}
          >Approve</SceneChoice>
          <SceneChoice
            pressed={decision === "denied"}
            onClick={() => choose("denied")}
            className={cn("flex-1 rounded-[7px] border p-[7px] text-center text-[11.5px] font-semibold text-ink", decision === "denied" ? "border-ink bg-[#EFE2D4]" : "border-[#CDBDA5]")}
          >Deny</SceneChoice>
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
          <span className="reading-word word-a">Must-be</span>{" "}<span className="reading-word word-b">features</span>{" "}<span className="reading-word word-c">go</span> unnoticed when present but
          cause frustration when missing.
        </p>
        <div className="ui-card absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full py-[9px] pl-[9px] pr-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-ink">
            <Pause className="size-3 fill-ground text-ground" />
          </span>
          <span className="hush-wave"><i /><i /><i /><i /><i /></span><span className="text-xs font-semibold">Heart</span>
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
        <div className="council-choices mt-3 flex gap-1.5">
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
function VisualContent({ visual }: { visual: VisualKey }) {
  switch (visual) {
    case "dor-globe": return <DorGlobe />;
    case "transformer-attention": return <TransformerAttention />;
    case "offer-flow":
    case "comms-flow":
    case "physician-flow":
    case "credential-flow":
    case "onboarding-flow":
    case "valuation-review":
    case "license-states":
      return <WorkIllustration kind={visual} />;
    case "focus-play":
      return <FocusPlayVisual />;
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

/** Every placement shares the same accessible, finite-motion policy. */
export function VisualPanel({ visual, className }: { visual: VisualKey; className?: string }) {
  return <MotionScene kind={visual} className={className}><VisualContent visual={visual} /></MotionScene>;
}
