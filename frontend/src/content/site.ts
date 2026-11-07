/*
 * Site content. Every claim here is sourced from the résumé, the Ask Ankit
 * knowledge base (backend/knowledge) or the project READMEs. Keep it that way:
 * outcomes are tagged by strength of evidence, and team results are labeled.
 */

export type EvidenceKind = "shipped" | "prototype" | "hypothesis";

export type EvidenceTag = {
  kind: EvidenceKind;
  label: string;
};

export type VisualKey =
  | "valuation-review"
  | "license-states"
  | "heads-down-mini"
  | "heads-down-window"
  | "tff-approval"
  | "tff-review"
  | "hush-player"
  | "council"
  | "ask-sample"
  | "ask-decline"
  | "offer-flow"
  | "comms-flow"
  | "physician-flow"
  | "credential-flow"
  | "onboarding-flow"
  | "focus-play";

export const evidenceKey: EvidenceTag[] = [
  { kind: "shipped", label: "Shipped" },
  { kind: "prototype", label: "Prototype evidence" },
  { kind: "hypothesis", label: "Hypothesis" },
];

export const hero = {
  eyebrow: "Product · Applied AI · Engineering",
  headline: "I find the problem worth solving, and stay with it until the",
  headlineEmphasis: "outcome moves.",
  lede:
    "I’m Ankit Ojha. For eight years I’ve worked on products where the hard part is the workflow — valuations at Pulley, clinical operations at Mochi Health — taking them from a vague request to a shipped product and a result you can point to. My title was engineer. I’m now moving into product management.",
};

export const proofPoints = [
  {
    figure: "Days → ~2 hrs",
    caption: "valuation turnaround after the platform launched · Pulley",
  },
  {
    figure: "~1,000 providers",
    caption: "using Clinical Ops workflows, supporting care for 200K+ patients · Mochi Health",
  },
  {
    figure: "Thousands",
    caption: "of offer letters sent through a V1 I built · Pulley",
  },
];

export const principles = [
  {
    numeral: "i.",
    title: "Find the expensive repetition.",
    body: "When skilled people repeat the same manual steps for every customer, that’s where software pays back fastest. The real work is separating what can become structure from what still needs their judgment.",
    seenIn: { label: "Pulley Valuation Platform", to: "/#work" },
  },
  {
    numeral: "ii.",
    title: "Design for the day it goes wrong.",
    body: "In operations, a mistake you can reverse is a ticket that never gets filed. Accurate state and a clear way back are product features, not edge cases.",
    seenIn: { label: "Mochi Health license workflow", to: "/#work" },
  },
  {
    numeral: "iii.",
    title: "Measure behavior, not launches.",
    body: "Shipping is the midpoint. At Mochi Health I introduced PostHog, FullStory and Cohere so the team could see where people struggled and A/B test the fixes.",
    seenIn: { label: "Mochi Health Clinical Ops", to: "/#about" },
  },
  {
    numeral: "iv.",
    title: "Let people overrule the AI.",
    body: "A model will be wrong some of the time. The product is how quickly a person can notice, correct it and keep going.",
    seenIn: { label: "Heads Down · TFF Harness", to: "/work/heads-down" },
  },
];

export type CaseSummary = {
  id: string;
  meta: string;
  title: string;
  problem: string;
  bet: string;
  outcome: string;
  outcomeIsStrong?: boolean;
  outcomeLabel?: string;
  role: string;
  tags: EvidenceTag[];
  href?: string;
  visual: VisualKey;
  visualCaption: string;
};

export const featuredCase: CaseSummary = {
  id: "valuation",
  meta: "Pulley · Fintech · 0-to-1",
  title: "Valuation Platform: from days to about two hours",
  problem:
    "Every 409A and token valuation meant the same expert analyst work, with many manual steps. The opportunity wasn’t a faster calculator. It was a repeatable workflow that kept analysts’ judgment where it mattered.",
  bet: "Structure the repeatable parts — inputs, review states, report generation — so analysts spend their time on judgment calls.",
  outcome:
    "Turnaround fell from days to about two hours, and the platform supported 1,800+ valuations in its first year.",
  outcomeIsStrong: true,
  role: "Led the analyst-tooling initiative for the Valuation Platform, partnering on workflow design and cross-functional delivery.",
  tags: [{ kind: "shipped", label: "Shipped · team outcome" }],
  href: "/work/valuation-platform",
  visual: "valuation-review",
  visualCaption: "Illustrative reconstruction, not production UI.",
};

export const supportingCases: CaseSummary[] = [
  {
    id: "license",
    meta: "Mochi Health · Healthcare operations",
    title: "License expiry: correct, clear and reversible",
    problem:
      "Operations teams rely on accurate provider license data. When status was stale or hard to undo, they lost time and engineering got the same tickets again.",
    bet: "Treat accuracy and reversibility as the product: explicit states, clear transitions and a way back from mistakes.",
    outcome:
      "Reduced a recurring class of operational tickets, in workflows used by ~1,000 providers supporting care for 200K+ patients.",
    role: "Joined discovery with operations, then led the Clinical Operations engineering behind the redesign.",
    tags: [{ kind: "shipped", label: "Shipped · qualitative outcome" }],
    href: "/work/license-workflow",
    visual: "license-states",
    visualCaption: "Illustrative state model",
  },
  {
    id: "heads-down",
    meta: "Independent · Applied AI · macOS",
    title: "Heads Down: blur the distraction, not the website",
    problem:
      "Blocklists decide by website. But a lecture on a video site can be exactly the work, and the feed beside it the distraction.",
    bet: "Judge content against the task, hide only what’s off-task, and make every wrong call one shortcut to undo.",
    outcomeLabel: "Evidence",
    outcome:
      "47 of 48 correct on a small labeled set; the private local option got 40. Not yet tested with users.",
    role: "Solo — problem framing, design, model evaluation and build.",
    tags: [
      { kind: "prototype", label: "Prototype evidence" },
      { kind: "hypothesis", label: "Hypothesis: helps focus" },
    ],
    href: "/work/heads-down",
    visual: "heads-down-mini",
    visualCaption: "Illustrative: scores shown in debug view",
  },
];

export const shortCase = {
  meta: "Pulley · Short read",
  title: "Offer Letter Builder: a V1 people actually used",
  body: "Scoped with product and design and taken through launch, with me as the sole engineer. The test of a V1 is adoption: thousands of offer letters were sent with it.",
  tag: { kind: "shipped", label: "Shipped" } satisfies EvidenceTag,
};

export const moreWork = [
  {
    title: "Communications Hub · Pulley",
    body: "Owned from concept through launch; replaced email-based investor updates with updates tied to company data.",
  },
  {
    title: "Collaborating Physicians · Mochi Health",
    body: "Launched a product that lets physicians supervise multiple nurse practitioners, expanding care capacity.",
  },
  {
    title: "Credentialing · Mochi Health",
    body: "Owned the product and engineering partnership with Insurance; improved speed and data consistency while migrating hundreds of thousands of records.",
  },
];

export type ProjectFilter = "AI products" | "Agents" | "macOS" | "Simulations" | "Learning";

export type Project = {
  slug: string;
  name: string;
  period: string;
  month: string;
  meta: string;
  filters: ProjectFilter[];
  status: EvidenceTag;
  indexStatus: EvidenceTag;
  /** Short, user-facing description used on the homepage. */
  pitch: string;
  /** One-line description used on the projects page. */
  oneLiner: string;
  productQuestion: string;
  principle: string;
  evidence: string;
  explores: string;
  stack: string;
  href?: string;
  sourceUrl?: string;
  visual: VisualKey;
  homeVisual: VisualKey;
};

// Newest first. Add new projects to the top; the index and filters pick them up.
export const projects: Project[] = [
  {
    slug: "heads-down",
    name: "Heads Down",
    period: "Oct 2026",
    month: "Oct 2026",
    meta: "Oct 2026 · macOS · Applied AI",
    filters: ["AI products", "macOS"],
    status: { kind: "prototype", label: "Prototype evidence" },
    indexStatus: { kind: "prototype", label: "Prototype" },
    pitch: "Task-aware focus for macOS: blurs only the parts of the screen that would pull you off your task.",
    oneLiner:
      "Task-aware focus for macOS: blurs only the regions of the front window that would pull you off your task.",
    productQuestion:
      "Can a model judge distraction by content, not by site, without taking control away?",
    principle: "Hide less than the model would, and keep undo one shortcut away.",
    evidence: "Builds and runs; 47/48 on a small hand-labeled benchmark. Not yet tested with users.",
    explores: "Selective intervention, model evaluation, privacy choices",
    stack: "Swift · ScreenCaptureKit · Vision · cloud and local classifiers",
    href: "/work/heads-down",
    visual: "heads-down-mini",
    homeVisual: "heads-down-mini",
  },
  {
    slug: "focus-play",
    name: "YouTube Focus Play",
    period: "Oct 2026",
    month: "Oct 2026",
    meta: "Oct 2026 · Learning · Applied AI",
    filters: ["AI products", "Learning"],
    status: { kind: "prototype", label: "Working prototype" },
    indexStatus: { kind: "prototype", label: "Prototype" },
    pitch: "Turn a learning goal and a time budget into short narrated lessons grounded in YouTube captions, with the original sources a click away.",
    oneLiner: "A time-bounded study experience built from YouTube teaching material, with local narration and source references.",
    productQuestion: "Can a useful study session fit the student’s time — and a viable cost to serve?",
    principle: "Price the experience before committing to the concept; keep every lesson traceable to its sources.",
    evidence: "A local prototype with narrated visuals, practice questions, source references and resumable preparation. The team’s product plan recommends no-go on the full AI-video concept because of cost and latency. Learning impact is not yet established.",
    explores: "Learning, time budgets, cost to serve, source trust",
    stack: "React · TypeScript · FastAPI · SQLite · local models · Kokoro · YouTube captions",
    href: "/work/focus-play",
    sourceUrl: "https://github.com/ankojh/focus-play",
    visual: "focus-play",
    homeVisual: "focus-play",
  },
  {
    slug: "hush",
    href: "/work/hush",
    name: "Hush",
    period: "Sep 2026",
    month: "Sep 2026",
    meta: "Sep 2026 · macOS · On-device AI",
    filters: ["AI products", "macOS"],
    status: { kind: "prototype", label: "Installed build" },
    indexStatus: { kind: "prototype", label: "Installed" },
    pitch:
      "Listen to anything you’ve selected, right where it is, with the words highlighted as they’re read — and nothing leaves your Mac.",
    oneLiner: "Reads selected text aloud in place, with a moving highlight, and nothing leaving the Mac.",
    productQuestion: "What does listening look like if it never pulls you out of your work?",
    principle: "Selected text is the default: the person decides what gets read.",
    evidence:
      "A standalone app with six English voices and 1–2× speed. It can keep following a document as new text streams in. On short passages it synthesized speech roughly twice as fast as playback; the newest versions still need regression tests.",
    explores: "Continuity, staying in the user’s workflow, local-only",
    stack: "Swift · AppKit · Python · Kokoro 82M via ONNX",
    visual: "hush-player",
    homeVisual: "hush-player",
  },
  {
    slug: "tff-harness",
    href: "/work/tff-harness",
    name: "TFF Harness",
    period: "Aug–Sep 2026",
    month: "Aug 2026",
    meta: "Aug–Sep 2026 · Agents",
    filters: ["AI products", "Agents"],
    status: { kind: "prototype", label: "Working prototype" },
    indexStatus: { kind: "prototype", label: "Prototype" },
    pitch:
      "A workspace for supervising AI agents. You see the plan, approve risky actions, steer mid-run and roll back changes — and the agent can’t call a task done without evidence.",
    oneLiner: "A supervised workspace for AI agents running against a local model server.",
    productQuestion: "How much autonomy can an agent have before people stop trusting it?",
    principle: "Autonomy is granted per run and per action — never assumed.",
    evidence:
      "Plans, per-action approvals, opt-in run grants, steering, stop and resume. Worker changes are reviewed hunk by hunk before they touch the workspace. Runs get deterministic quality and safety checks and can be saved as replayable eval scenarios.",
    explores: "Autonomy, approvals, recovery, evals",
    stack: "Python · FastAPI · Docker sandbox · OpenAI-compatible APIs",
    visual: "tff-review",
    homeVisual: "tff-approval",
  },
  {
    slug: "yudhyantra",
    href: "/work/yudhyantra",
    name: "Yudhyantra",
    period: "Jul–Sep 2026",
    month: "Jul 2026",
    meta: "Jul–Sep 2026 · Simulation · Multi-agent",
    filters: ["AI products", "Agents", "Simulations"],
    status: { kind: "hypothesis", label: "Experiment" },
    indexStatus: { kind: "hypothesis", label: "Experiment" },
    pitch:
      "A fictional strategy simulation. Two AI commanders act within strict rules while you chair a neutral council — you can answer their requests, but never take a side.",
    oneLiner:
      "A fictional strategy simulation: two AI commanders act for rival island nations while you chair a neutral council.",
    productQuestion: "How do you give agents real autonomy and keep every outcome explainable?",
    principle: "What happens on screen is exactly what happened in the rules.",
    evidence:
      "A playable web app. Commanders choose only from server-listed legal moves; a separate arbiter returns typed judgments; a deterministic engine owns every number. You can answer requests but never command a side. Balance checked across 40 seeded mock matches.",
    explores: "Bounded autonomy, legibility, human decisions",
    stack: "Python · FastAPI · TypeScript · Canvas · OpenAI Responses API · Jev",
    visual: "council",
    homeVisual: "council",
  },
  {
    slug: "ask-ankit",
    name: "Ask Ankit",
    period: "Jun 2026",
    month: "Jun 2026",
    meta: "Jun 2026 · RAG",
    filters: ["AI products"],
    status: { kind: "shipped", label: "Built into this site" },
    indexStatus: { kind: "shipped", label: "On this site" },
    pitch:
      "Ask about my work and get answers grounded in notes I wrote, with sources. It declines anything off-topic, and the site still reads clearly without it.",
    oneLiner: "A portfolio assistant grounded in notes I wrote about my own work.",
    productQuestion: "Can a chatbot help someone skim without inventing anything?",
    principle: "The chat is optional; the site must make sense without typing.",
    evidence:
      "A Markdown knowledge base with retrieval and cited answers. Off-topic questions are rejected before any embedding or model call; private details are kept out of the knowledge base entirely.",
    explores: "Grounding, scope, knowing what not to answer",
    stack: "React · FastAPI · PostgreSQL + pgvector · OpenAI",
    href: "/work/ask-ankit",
    visual: "ask-decline",
    homeVisual: "ask-sample",
  },
];

export const projectFilters: ProjectFilter[] = ["AI products", "Agents", "macOS", "Simulations", "Learning"];

// Engineering is presented as product leverage: each item pairs the engineering record with what it changes in product work.
export const engineeringDepth = {
  credential: "Senior Full-Stack Engineer · 2017–2026",
  headline: "Eight years of building,",
  emphasis: "used to make better product calls.",
  body: "My title has been engineer. It’s why I can judge feasibility while options are still on the table, spot a system’s constraints before they surprise the roadmap, and build the prototype when a decision needs evidence.",
  items: [
    {
      title: "Delivery from scope to launch",
      body: "Led frontend development of Pulley’s Valuation Platform, built V1 of the Offer Letter Builder as sole engineer, and led a 4–5 person team taking Zoho’s no-code website builder from whiteboard to V0.",
      forProduct: "I know where a plan slips between scoping and launch.",
    },
    {
      title: "Systems that survive operations",
      body: "State models for clinical operations, a credentialing migration of hundreds of thousands of records, and a graph library with custom layout for 7,000+ nodes at Zoho.",
      forProduct: "I plan for the mistakes and edge cases real users will hit.",
    },
    {
      title: "Feasibility in the room",
      body: "React and TypeScript frontends, Node.js and Python backends, PostgreSQL data models — enough range to size an option while it’s being discussed.",
      forProduct: "Tradeoffs get made in the meeting, not a sprint later.",
    },
    {
      title: "Prototypes and data as evidence",
      body: "I introduced PostHog, FullStory and Cohere at Mochi Health, and built the 48-case benchmark behind Heads Down.",
      forProduct: "Decisions rest on behavior I can check, not assumption.",
    },
  ],
  stack: "React · TypeScript · Next.js · Node.js · Python / FastAPI · PostgreSQL · GraphQL · LLM APIs, retrieval and evals",
};

export const about = {
  headline: "Eight years of product work, done from the engineering seat.",
  body: "At Zoho I helped take a no-code website builder from whiteboard to V0 while leading a small team. At Pulley I joined early and worked with product and design to shape several 0-to-1 products. At Mochi Health I led Clinical Operations engineering, joined discovery with operations, and introduced the analytics we used to decide what to fix next. Now I’m moving into product management full-time.",
  personal: "Outside work: I reached the top of Meesapulimala on my second attempt.",
};

export const education = {
  institution: "Carnegie Mellon University",
  degree: "Master’s in Software Management",
  abbreviation: "MSSM",
};

export const experience = [
  {
    years: "2024–2026",
    title: "Senior Full-Stack Engineer",
    org: "Mochi Health",
    focus: "Clinical Ops discovery, analytics and launches",
  },
  {
    years: "2020–2024",
    title: "Senior Full-Stack Engineer",
    org: "Pulley",
    focus: "Early hire · 0-to-1 products with product and design",
  },
  {
    years: "2017–2020",
    title: "Software Engineer",
    org: "Zoho",
    focus: "No-code website builder, whiteboard to V0",
  },
  {
    years: "2017",
    title: "",
    org: "SRM Institute of Science and Technology",
    focus: "Bachelor’s in Software Engineering",
  },
];

export const askSuggestions = [
  "Why product management?",
  "What did Ankit own at Pulley?",
  "How does he use data to decide?",
];
