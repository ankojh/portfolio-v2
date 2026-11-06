import type { ReactNode } from "react";

import { ArchFrame, EvidenceBadge, Eyebrow } from "@/components/site/Brand";
import { Link } from "@/components/site/Link";
import { HeadsDownPanelBody, HeadsDownWindow } from "@/components/visuals/ProductVisuals";

/* Sources: heads-down/README.md and heads-down/bench/FINDINGS.md. */

const summary = [
  { label: "Problem", body: "Blocklists judge sites. People get distracted by content — often on the same page as their work." },
  { label: "Bet", body: "Score each region against the task, hide only what’s off-task, and make undo instant." },
  { label: "Evidence so far", body: "47/48 on a labeled benchmark; prompt wording mattered more than model choice." },
  { label: "Next", body: "Real study sessions, measured by repeat use, reveals and pauses." },
];

const constraints = [
  { title: "Screen text is personal", body: "Nothing should leave the Mac without an explicit choice, and nothing sensitive should be logged." },
  { title: "It must never trap you", body: "Pause and stop have to work even when OCR or the classifier is slow." },
  { title: "Every region costs a call", body: "Scrolling and re-layout can multiply requests if nothing is cached." },
  { title: "Apps expose different structure", body: "Native apps describe their controls; many Electron and web views don’t." },
];

const decisions = [
  {
    title: "Judge regions of the screen, not sites",
    body: "Text is grouped into regions — a card, a message group, a paragraph — and each is scored against the task.",
    tradeoff: "more model calls. Scores are cached by exact text, sent at most once per second, and never sent mid-scroll.",
  },
  {
    title: "Hide less than the model would",
    body: "Title bars, tabs, address bars and controls stay visible at every level. Three hiding levels, with Balanced as the default.",
    tradeoff: "tab titles can still distract. Links don’t count as controls, because feed titles are links.",
  },
  {
    title: "Make wrong calls cheap to undo",
    body: "Reveal any region for ten minutes with one shortcut; pause for two or three minutes and resume automatically; an emergency toggle that never times out. Every pause clears coverage at once.",
    tradeoff: "easy to bypass. It’s a focus aid, not a security boundary — on purpose.",
  },
  {
    title: "Ask once before screen text leaves the Mac",
    body: "The cloud classifier runs only after one-time consent; declining switches to a local model. Screenshots are never sent, and the log never holds screen text, task text or window titles.",
    tradeoff: "the private option is less accurate today (40 of 48 vs 47 of 48).",
  },
  {
    title: "When unsure, stay covered",
    body: "New text inside a covered area stays covered until it has its own score. An old score is never reused for new text.",
    tradeoff: "brief over-blurring after scrolls and hovers, in exchange for never flashing a distraction.",
  },
];

const classifierBars = [
  { group: "All cases · 48", jev: 47, laya: 40, total: 48 },
  { group: "Tricky cases · 11", jev: 10, laya: 5, total: 11 },
];

const phrasingBars = [
  { prompt: "Keep or blur? (choice, topic-focused)", value: 85 },
  { prompt: "Would this pull the user away?", value: 83 },
  { prompt: "Same subject as the task?", value: 46 },
  { prompt: "Does this help the user’s task?", value: 44 },
];

const metrics = [
  { kind: "Outcome", title: "Sessions people choose to start again", body: "Repeat use within a week says it helped more than it annoyed." },
  { kind: "Trust signal", title: "Reveals per hour", body: "Frequent reveals mean useful content is being hidden: the model or the cutoff is wrong." },
  { kind: "Friction signal", title: "Pauses and early stops", body: "Rising pauses suggest the product feels too strict, even when the model is right." },
  { kind: "Guardrail", title: "Cost and wait per session", body: "Classifier spend is already estimated per session in the Inspector; time-to-score keeps covers honest." },
];

const failureModes = [
  ["Judging the site", "On-task videos and threads get blurred", "Default to the more accurate classifier; keep local as the private option"],
  ["Apps that hide structure", "A search box inside a covered area can be covered", "Fall back to OCR text blocks and keep the top strip visible; reveal fixes the rest"],
  ["Fast scrolls and navigation", "Cover positions can’t be verified", "Mask the pane until it’s re-read, rather than reveal stale content"],
  ["Uncalibrated cutoffs", "0.50 and 0.65 come from one session’s scores", "Documented as a known limit; reveal and pause cover the gap until calibration"],
  ["Full-screen windows", "Not supported", "Clear all coverage and say so, instead of guessing"],
];

const leftOut = [
  { title: "Blocklists and site rules", note: "by design", body: "They are the behavior the product exists to replace." },
  { title: "Locking people out", note: "by design", body: "Pause always works. This is a focus aid, not enforcement." },
  { title: "Images, video and non-English text", body: "Regions are text only for now." },
  { title: "Background windows and second displays", body: "Only the front window on one display is read." },
];

const lessons = [
  { title: "The question is a product decision.", body: "Prompt wording moved accuracy more than the choice of model did." },
  { title: "Undo is a feature.", body: "Reveal and pause are what make it acceptable for the model to be wrong." },
  { title: "Pin what you evaluate.", body: "A benchmark only means something for the exact model version it ran on." },
];

const pipeline = [
  { step: "1 · Capture", title: "Front window", body: "ScreenCaptureKit, every 400 ms; changes compared in 8×8 cells" },
  { step: "2 · Read", title: "Text and structure", body: "Accessibility tree plus Vision OCR, re-read only where it changed" },
  { step: "3 · Group", title: "Regions", body: "Cards, message groups, paragraphs, from containers and layout" },
  { step: "4 · Classify", title: "Score vs. task", body: "Cache by canonical text; one dispatch round per second; backoff on errors" },
  { step: "5 · Cover", title: "Blur overlay", body: "Click-through; follows scrolling by measuring motion in a 6×6 grid" },
];

function CaseSection({
  number,
  title,
  id,
  children,
  wide = false,
}: {
  number: string;
  title: string;
  id?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className="flex flex-wrap gap-x-16 gap-y-5 border-t border-rule py-12 sm:py-[72px]">
      <div className="w-full lg:w-60 lg:shrink-0">
        <div className="font-serif text-lg italic text-terra sm:text-xl">{number}</div>
        <h2 className="display mt-1.5 text-[26px] leading-tight sm:text-[30px]">{title}</h2>
      </div>
      <div className={wide ? "min-w-0 flex-[1_1_560px]" : "min-w-0 max-w-[820px] flex-[1_1_560px]"}>{children}</div>
    </section>
  );
}

function Bar({ value, total, color }: { value: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 border-l border-[#B9AA94]">
        <div className="h-3 rounded-r" style={{ width: `${(value / total) * 100}%`, background: color }} />
      </div>
      <span className="w-11 text-[13.5px] font-semibold">{value}</span>
    </div>
  );
}

export function HeadsDownCaseStudy() {
  return (
    <main id="main" className="mx-auto w-full max-w-site px-5 pb-10 sm:px-14">
      <div className="pb-8 pt-4 sm:pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-quiet">
          <Link to="/#work" className="text-terra hover:text-terra-deep">Work</Link> <span aria-hidden="true">/</span> Heads Down
        </nav>
        <Eyebrow className="mt-8 sm:mt-10">Case study · Independent project · Applied AI</Eyebrow>
        <h1 className="display mt-3 max-w-[960px] text-[38px] leading-[1.06] tracking-[-0.022em] sm:mt-[18px] sm:text-[66px] sm:leading-[1.04]">
          Heads Down: blur the distraction, <em className="italic text-terra">not the website.</em>
        </h1>
        <p className="mt-4 max-w-[760px] text-[16.5px] leading-relaxed text-body sm:mt-[26px] sm:text-xl">
          A macOS focus tool that knows what you’re working on, reads the front window, and hides only the parts that would pull you away from it — while leaving you an easy way back.
        </p>

        <dl className="mt-8 grid grid-cols-2 border-y border-rule sm:mt-11 lg:grid-cols-4">
          <div className="col-span-2 border-b border-rule py-4 pr-5 sm:col-span-1 sm:border-b-0 lg:py-[18px]">
            <dt className="label text-[11px]">My role</dt>
            <dd className="mt-2 text-[15px] leading-normal">Solo — problem framing, interaction design, model evaluation, Swift build</dd>
          </div>
          <div className="border-rule py-4 pr-5 sm:border-l sm:px-5 lg:py-[18px]">
            <dt className="label text-[11px]">Platform</dt>
            <dd className="mt-2 text-[15px] leading-normal">Native macOS menu-bar app with a cloud or local classifier</dd>
          </div>
          <div className="border-l border-rule py-4 pl-5 lg:py-[18px]">
            <dt className="label text-[11px]">When</dt>
            <dd className="mt-2 text-[15px] leading-normal">Fall 2026</dd>
          </div>
          <div className="col-span-2 border-t border-rule py-4 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:py-[18px]">
            <dt className="label text-[11px]">Status</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              <EvidenceBadge kind="prototype" label="Working prototype" />
              <EvidenceBadge kind="hypothesis" label="No user testing yet" />
            </dd>
          </div>
        </dl>
      </div>

      <section aria-label="Summary" className="grid grid-cols-1 overflow-hidden rounded-[20px] border border-[#E4D9C7] bg-paper sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item, index) => (
          <div key={item.label} className={index > 0 ? "border-t border-[#EDE3D4] px-6 py-5 sm:border-t-0 sm:border-l lg:py-[22px]" : "px-6 py-5 lg:py-[22px]"}>
            <div className="label text-[10.5px] text-terra">{item.label}</div>
            <p className="mt-2 text-[15px] leading-normal">{item.body}</p>
          </div>
        ))}
      </section>

      <figure className="mt-12 sm:mt-14">
        <ArchFrame shape="low" className="hidden h-[600px] md:block">
          <HeadsDownWindow />
        </ArchFrame>
        <ArchFrame shape="tall" className="h-[400px] md:hidden">
          <div className="ui-card absolute inset-x-4 top-32 rounded-[14px] p-4" role="img" aria-label="Illustration: the Heads Down panel showing the current task, the Balanced hiding level and pause options.">
            <div aria-hidden="true">
              <HeadsDownPanelBody />
            </div>
          </div>
        </ArchFrame>
        <figcaption className="mt-3.5 text-[13px] leading-normal text-quiet">
          Illustrative composite. The lecture stays visible because it matches the task; the recommendations beside it are blurred. Tabs and the address bar always stay visible, as do controls the app exposes to accessibility.
        </figcaption>
      </figure>

      <div className="mt-14 sm:mt-[72px]">
        <CaseSection number="01" title="The user and the problem">
          <p className="text-[16.5px] leading-[1.7] text-[#3F372F] sm:text-[17.5px]">
            Heads Down is for people whose work lives in the same apps and sites that distract them: a student watching a lecture, an engineer reading docs, someone researching an essay. Blocklists decide by website. That fails both ways — a Kano-model lecture on a video site is on-task for someone studying product management, and the recommendations next to it are not.
          </p>
          <p className="display mt-7 text-[24px] leading-[1.3] sm:mt-8 sm:text-[30px]">
            Distraction isn’t a property of a website. It’s a property of <em className="italic text-terra">content relative to a task.</em>
          </p>
        </CaseSection>

        <CaseSection number="02" title="Constraints that shaped it">
          <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
            {constraints.map((item) => (
              <div key={item.title} className="border-t border-rule pb-[22px] pt-[18px]">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-body">{item.body}</p>
              </div>
            ))}
          </div>
        </CaseSection>

        <CaseSection number="03" title="Decisions and tradeoffs" id="decisions" wide>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
            {decisions.map((decision, index) => (
              <div key={decision.title} className="flex flex-col gap-3 rounded-[18px] border border-[#E4D9C7] bg-paper p-5 sm:p-[26px] sm:pb-[22px]">
                <div className="label text-[11px] text-terra">Decision {index + 1}</div>
                <h3 className="display text-[22px] font-medium leading-tight sm:text-[25px]">{decision.title}</h3>
                <p className="text-[15.5px] leading-relaxed text-body">{decision.body}</p>
                <p className="mt-1 border-t border-[#EDE3D4] pt-3 text-[14.5px] leading-normal text-quiet">
                  <b className="font-semibold text-ink">Tradeoff:</b> {decision.tradeoff}
                </p>
              </div>
            ))}
            <div className="flex flex-col gap-3 rounded-[18px] border border-[#E4D6C1] bg-sand p-5 sm:p-[26px]">
              <div className="label text-[11px] text-terra">Extension</div>
              <h3 className="display text-[22px] font-medium leading-tight sm:text-[25px]">Start from the calendar, but never wait on it</h3>
              <p className="text-[15.5px] leading-relaxed text-body">
                An optional local agent turns the current event into a task brief. It may ask one clarifying question, but focus starts immediately — and a typed task always wins.
              </p>
            </div>
          </div>
        </CaseSection>

        <CaseSection number="04" title="Model evaluation" id="evaluation" wide>
          <p className="max-w-[780px] text-[16.5px] leading-[1.7] text-[#3F372F] sm:text-[17.5px]">
            I built a benchmark before trusting either model: 48 hand-labeled screen regions across four tasks — studying product management, coding a backend, a group sync call, a history essay. Eleven are <b className="font-semibold">tricky</b>: a fixed blocklist would get them wrong.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <figure className="rounded-[18px] border border-[#E4D9C7] bg-paper p-5 sm:p-[26px]">
              <figcaption>
                <div className="text-base font-semibold">Correct calls, by classifier</div>
                <div className="mt-1 text-[13.5px] text-quiet">Cases answered correctly</div>
              </figcaption>
              <div className="mt-4 flex gap-4 text-[13px] text-body" aria-hidden="true">
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-[3px] bg-ink" />Jev (cloud)</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-[3px] bg-[#C58A68]" />Laya (local)</span>
              </div>
              <div className="mt-5 flex flex-col gap-5">
                {classifierBars.map((row) => (
                  <div key={row.group}>
                    <div className="mb-2 text-[13.5px] font-semibold">{row.group}</div>
                    <Bar value={row.jev} total={row.total} color="#1E1A16" />
                    <div className="mt-1" />
                    <Bar value={row.laya} total={row.total} color="#C58A68" />
                  </div>
                ))}
              </div>
              <table className="sr-only">
                <caption>Correct calls by classifier</caption>
                <thead><tr><th>Set</th><th>Jev (cloud)</th><th>Laya (local)</th></tr></thead>
                <tbody>
                  {classifierBars.map((row) => (
                    <tr key={row.group}><td>{row.group}</td><td>{row.jev}</td><td>{row.laya}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-5 text-sm leading-normal text-body">
                The local model behaved like a site blocker: it marked a Kano-model lecture as distracting (0.91) and a sports score during a team call as fine.
              </p>
            </figure>
            <figure className="rounded-[18px] border border-[#E4D9C7] bg-paper p-5 sm:p-[26px]">
              <figcaption>
                <div className="text-base font-semibold">The wording of the question mattered most</div>
                <div className="mt-1 text-[13.5px] text-quiet">Laya (local) accuracy on the same 48 cases, by prompt wording</div>
              </figcaption>
              <div className="mt-5 flex flex-col gap-4">
                {phrasingBars.map((row) => (
                  <div key={row.prompt}>
                    <div className="mb-1.5 text-[13.5px] text-[#3F372F]">{row.prompt}</div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 border-l border-[#B9AA94]">
                        <div className="h-3 rounded-r bg-[#C58A68]" style={{ width: `${row.value}%` }} />
                      </div>
                      <span className="w-11 text-[13.5px] font-semibold">{row.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-normal text-body">
                Asking about relevance instead of distraction — logically the same question — fell below a coin flip. Any wording change now gets re-run against the benchmark.
              </p>
            </figure>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm leading-normal text-quiet">
            <span className="flex-[1_1_360px]">Caveat: 48 synthetic cases, labeled by me. Enough to choose a model and a question — not a measure of accuracy on real screens.</span>
            <span className="flex-[1_1_300px]">The cloud model version is pinned, so a provider update can’t silently change what gets hidden.</span>
          </div>
        </CaseSection>

        <CaseSection number="05" title="How I’d know it works" wide>
          <p className="max-w-[780px] text-[16.5px] leading-[1.7] text-[#3F372F] sm:text-[17.5px]">
            Accuracy on a benchmark isn’t the outcome. The outcome is people staying on task without feeling policed. These are the signals I’d instrument for the first real study sessions.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.title} className="rounded-2xl bg-sand p-5">
                <div className="label text-[10.5px] text-terra">{metric.kind}</div>
                <div className="display mt-2 text-[22px] leading-tight">{metric.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-body">{metric.body}</p>
              </div>
            ))}
          </div>
          <EvidenceBadge kind="hypothesis" label="Proposed — not yet measured with users" className="mt-4" />
        </CaseSection>

        <CaseSection number="06" title="When it’s wrong" wide>
          <div className="overflow-x-auto rounded-[18px] border border-[#E4D9C7] bg-paper">
            <table className="w-full min-w-[720px] border-collapse text-[15px] leading-normal">
              <thead>
                <tr className="text-left">
                  {["Failure", "What happens", "How the product responds"].map((heading) => (
                    <th key={heading} scope="col" className="label border-b border-[#E4D9C7] px-[22px] py-4 text-[11px]">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {failureModes.map(([failure, happens, response], index) => (
                  <tr key={failure} className={index < failureModes.length - 1 ? "border-b border-[#EFE6D8]" : undefined}>
                    <td className="px-[22px] py-4 align-top font-semibold">{failure}</td>
                    <td className="px-[22px] py-4 align-top text-body">{happens}</td>
                    <td className="px-[22px] py-4 align-top text-body">{response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CaseSection>

        <CaseSection number="07" title="What’s proven, and what isn’t" wide>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="border-t-2 border-ink pt-[18px]">
              <EvidenceBadge kind="prototype" label="Prototype evidence" />
              <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-[18px] text-[15px] leading-relaxed text-[#3F372F]">
                <li>Builds, launches as a menu-bar app, and quits cleanly.</li>
                <li>Benchmark results above.</li>
                <li>Synthetic regression checks for cover continuity.</li>
                <li>Local calendar agent on synthetic events: asked one question for a “Weekly 1:1”, ignored an injected instruction, skipped a personal event.</li>
              </ul>
            </div>
            <div className="border-t-2 border-ink pt-[18px]">
              <EvidenceBadge kind="hypothesis" label="Not yet verified" />
              <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-[18px] text-[15px] leading-relaxed text-[#3F372F]">
                <li>Cover alignment and scroll tracking on real apps.</li>
                <li>End-to-end latency in a real session.</li>
                <li>Calendar auto-start against real calendars.</li>
              </ul>
            </div>
            <div className="border-t-2 border-ink pt-[18px]">
              <EvidenceBadge kind="hypothesis" label="Hypothesis to test" />
              <p className="display mt-4 text-[22px] leading-[1.35]">
                Task-aware blur keeps people on task better than a blocklist, without hiding what they need.
              </p>
              <p className="mt-2.5 text-[14.5px] leading-normal text-quiet">
                Next: real study sessions — collect real screens, calibrate cutoffs, and track where people reveal.
              </p>
            </div>
          </div>
        </CaseSection>

        <CaseSection number="08" title="What I left out of v1" wide>
          <p className="max-w-[780px] text-[16.5px] leading-[1.7] text-[#3F372F] sm:text-[17.5px]">
            A focused v1 meant saying no to things that would have been easy to want. Some are deliberate; some are simply next.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-x-10 md:grid-cols-2">
            {leftOut.map((item) => (
              <div key={item.title} className="border-t border-rule py-4">
                <div className="text-[15.5px] font-semibold">
                  {item.title}
                  {item.note && <span className="font-medium text-terra"> · {item.note}</span>}
                </div>
                <p className="mt-1 text-[14.5px] leading-normal text-body">{item.body}</p>
              </div>
            ))}
          </div>
        </CaseSection>

        <CaseSection number="09" title="What I took from it" wide>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {lessons.map((lesson) => (
              <div key={lesson.title}>
                <h3 className="display text-2xl font-medium">{lesson.title}</h3>
                <p className="mt-2.5 text-[15.5px] leading-relaxed text-body">{lesson.body}</p>
              </div>
            ))}
          </div>
        </CaseSection>

        <section className="flex flex-wrap gap-x-16 gap-y-5 border-t border-rule py-12 opacity-95 sm:py-[72px]">
          <div className="w-full lg:w-60 lg:shrink-0">
            <div className="label">Appendix</div>
            <h2 className="display mt-2 text-2xl leading-tight">How it works, briefly</h2>
          </div>
          <div className="min-w-0 flex-[1_1_560px]">
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {pipeline.map((item) => (
                <li key={item.step} className="rounded-[14px] bg-sand p-[18px]">
                  <div className="label text-[10.5px]">{item.step}</div>
                  <div className="mt-2 text-[15px] font-semibold">{item.title}</div>
                  <div className="mt-1.5 text-[13.5px] leading-normal text-body">{item.body}</div>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[14.5px] leading-relaxed text-quiet">
              Swift, SwiftUI and AppKit · ScreenCaptureKit · Accessibility · Vision · Core Image · EventKit · Ollama for the optional local agent.
            </p>
          </div>
        </section>
      </div>

      <Link
        to="/projects"
        className="my-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-sand px-6 py-7 text-ink sm:px-10 sm:py-9"
      >
        <span>
          <span className="label block">Next</span>
          <span className="display mt-2 block text-[24px] sm:text-[32px]">See the rest of the projects</span>
        </span>
        <span className="text-base font-semibold text-terra">Projects →</span>
      </Link>
    </main>
  );
}
