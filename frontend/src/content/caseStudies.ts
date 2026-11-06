import { type CaseSummary, type VisualKey, featuredCase, projects, supportingCases } from "@/content/site";

// Work claims: backend/knowledge/{03_mochi_health,04_pulley_experience,17_resume_source_of_truth}.md.
// Onboarding detail was supplied directly by Ankit: brought into the portal, including data collection and credentialing.
const shipped = [{ kind: "shipped" as const, label: "Shipped" }];
export const workCases: CaseSummary[] = [
  featuredCase,
  supportingCases.find((item) => item.id === "license")!,
  {
    id: "offer-letter", meta: "Pulley · Hiring & equity", title: "An offer workflow people actually used.",
    problem: "Companies needed a reliable way to create and manage offer letters alongside their equity workflows.",
    bet: "Scope a usable first version with product and design, and carry it through launch with clear end-to-end ownership.",
    outcome: "Thousands of offer letters were sent through the product after launch.",
    role: "Owned V1 as the sole engineer, partnering with product and design from scoping through launch.",
    tags: shipped, href: "/work/offer-letter", visual: "offer-flow", visualCaption: "Conceptual offer workflow",
  },
  {
    id: "communications-hub", meta: "Pulley · Investor communication", title: "Company updates, connected to company data.",
    problem: "Investor updates lived in email-based workflows, separated from the company data they were meant to communicate.",
    bet: "Bring investor communication into the product and connect updates to the company’s data.",
    outcome: "Replaced email-based workflows with more consistent, transparent investor updates.",
    role: "Owned the Communications Hub from concept through launch.",
    tags: shipped, href: "/work/communications-hub", visual: "comms-flow", visualCaption: "Conceptual communication workflow",
  },
  {
    id: "collaborating-physicians", meta: "Mochi Health · Care operations", title: "One physician. A broader care team.",
    problem: "Care operations needed a way for physicians to supervise multiple nurse practitioners as the provider network grew.",
    bet: "Make the collaborating-physician relationship a supported product workflow.",
    outcome: "Launched the Collaborating Physicians product, expanding care capacity across hundreds of providers in the United States.",
    role: "Built and launched the Collaborating Physicians product within Clinical Operations.",
    tags: shipped, href: "/work/collaborating-physicians", visual: "physician-flow", visualCaption: "Conceptual supervision model",
  },
  {
    id: "credentialing", meta: "Mochi Health · Insurance operations", title: "Reliable credentials, through a large migration.",
    problem: "Insurance operations needed a credentialing system that improved workflow speed and data consistency while existing records moved into it.",
    bet: "Own the product and engineering partnership with Insurance, treating workflow design and migration as parts of the same delivery.",
    outcome: "Improved speed and data consistency while migrating hundreds of thousands of records.",
    role: "Owned the product and engineering partnership with Insurance to build the credentialing system.",
    tags: shipped, href: "/work/credentialing", visual: "credential-flow", visualCaption: "Conceptual migration and credentialing flow",
  },
  {
    id: "provider-onboarding", meta: "Mochi Health · Provider experience", title: "Bring onboarding inside the portal.",
    problem: "Provider onboarding happened outside the Mochi portal, separating the start of a provider’s journey from the tools used to manage it.",
    bet: "Bring onboarding into the portal, including provider data collection and credentialing steps.",
    outcome: "A more streamlined onboarding workflow, with data collection and credentialing steps inside the Mochi portal.",
    role: "Built the in-portal provider onboarding workflow, including data collection and credentialing steps.",
    tags: shipped, href: "/work/provider-onboarding", visual: "onboarding-flow", visualCaption: "Conceptual in-portal onboarding flow",
  },
];

export type Decision = { title: string; detail: string; tradeoff: string };
export type CaseStudy = {
  slug: string; title: string; meta: string; summary: string; question: string; role: string;
  decisions: Decision[]; evidence: string; limits: string; next: string;
  visual: VisualKey; caption: string; sourceUrl?: string; tryHref?: string;
};

type Notes = Pick<CaseStudy, "question" | "decisions" | "limits" | "next">;
const workNotes: Record<string, Notes> = {
  valuation: {
    question: "How much of a valuation can become a repeatable workflow while preserving expert judgment?",
    decisions: [
      { title: "Make the repeated work explicit", detail: "The initiative brought analyst tooling, structured inputs, review states and generated documents into a more repeatable process. I led the analyst-facing implementation and partnered on the workflow design.", tradeoff: "Standardization has to leave room for the analyst’s case-specific judgment." },
      { title: "Judge the platform by turnaround", detail: "The meaningful result was the time it took to deliver a valuation and the volume the team could support.", tradeoff: "Those are platform and team results; they cannot be attributed to one contributor or one interface change." },
    ],
    limits: "The reported turnaround and first-year volume describe the platform as a whole. They are not a controlled estimate of my individual impact.",
    next: "A useful follow-up would separate time spent gathering inputs, reviewing and generating reports to identify the next constraint.",
  },
  license: {
    question: "Can operations correct a license-state mistake without creating another engineering ticket?",
    decisions: [
      { title: "Treat state as the product", detail: "The work focused on accurate license states and clear transitions so operations could understand what had happened.", tradeoff: "A clear interface depends on the underlying state model being correct." },
      { title: "Make correction part of the workflow", detail: "Reversibility gave the operations team a way back from mistakes, addressing a recurring source of manual incidents.", tradeoff: "A recovery path needs to be understandable alongside the normal path, rather than hidden as an exceptional action." },
    ],
    limits: "The reduction in recurring support issues is qualitative. The approximately 1,000 providers and 200K+ patients describe the wider Clinical Operations context.",
    next: "Track recurrence of the same incident class and time to correction, alongside incorrect state transitions.",
  },
  "offer-letter": {
    question: "What is the smallest complete offer workflow that companies will actually adopt?",
    decisions: [
      { title: "Scope with product and design", detail: "I partnered with product and design from early scoping, while owning the engineering work end to end as the sole engineer on V1.", tradeoff: "A single-owner build makes scope discipline especially important; every addition competes with getting the complete workflow into use." },
      { title: "Follow the idea through launch", detail: "The work continued through delivery so the output was a usable product, with adoption visible in the thousands of letters sent.", tradeoff: "Usage demonstrates adoption, but does not by itself establish improvements in hiring conversion or time to offer." },
    ],
    limits: "The documented outcome is thousands of letters sent. No conversion lift or time-saving percentage is claimed.",
    next: "Measure where users abandon creation, how often they revise a letter, and whether they return for the next offer.",
  },
  "communications-hub": {
    question: "What changes when investor updates share a home with the company’s data?",
    decisions: [
      { title: "Connect the message to its context", detail: "The Communications Hub replaced an email-based process with investor updates connected to company data.", tradeoff: "Bringing communication into a product means the workflow must be convenient enough for people to leave their existing email habit." },
      { title: "Own the complete transition", detail: "I owned the work from concept through launch, keeping the product idea and the delivered communication workflow connected.", tradeoff: "Consistency and transparency are qualitative results here; they should not be presented as measured engagement lift." },
    ],
    limits: "No public open-rate, retention or time-saving metric is available for this project.",
    next: "Look at repeat update creation and recipient engagement, and learn where people still return to email.",
  },
  "collaborating-physicians": {
    question: "How can the product support a physician working with multiple nurse practitioners?",
    decisions: [
      { title: "Model the care-team relationship", detail: "The product enabled physicians to supervise multiple nurse practitioners, making that relationship part of the operational workflow.", tradeoff: "A useful relationship model must remain understandable as the number of providers grows." },
      { title: "Connect the launch to care capacity", detail: "I built and launched the product within Clinical Operations. Its documented result was expanded care capacity across hundreds of providers.", tradeoff: "Capacity is a workflow outcome; it does not establish a change in patient health outcomes." },
    ],
    limits: "The available evidence supports launch and expanded capacity, without a precise percentage increase or clinical outcome claim.",
    next: "Evaluate setup completion, operational exceptions and whether the team can maintain those relationships as the network grows.",
  },
  credentialing: {
    question: "How do you improve the workflow while protecting the quality of the data it depends on?",
    decisions: [
      { title: "Work with Insurance as a product partner", detail: "I owned the product and engineering partnership with Insurance to build a credentialing system around the operational work.", tradeoff: "Workflow requirements and implementation constraints need to be resolved together, rather than handed off once." },
      { title: "Deliver the migration with the product", detail: "The work included migrating hundreds of thousands of records while improving speed and data consistency.", tradeoff: "A new interface is only useful if the information carried into it remains reliable." },
    ],
    limits: "The migration covered hundreds of thousands of records. I don’t have a precise before-and-after measure of credentialing speed.",
    next: "Measure record discrepancies and time spent resolving credentialing exceptions, alongside completion time.",
  },
  "provider-onboarding": {
    question: "Why should a provider’s first steps happen outside the portal they are joining?",
    decisions: [
      { title: "Bring the starting point into the portal", detail: "Provider onboarding previously happened outside the Mochi portal. I built it into the product to make the journey more streamlined.", tradeoff: "Bringing a process inside the product also makes the product responsible for making each step understandable." },
      { title: "Connect collection and credentialing", detail: "The in-portal workflow included collecting provider data and the credentialing steps that followed it.", tradeoff: "The information requested must serve the downstream process; collecting more data is not automatically a better experience." },
    ],
    limits: "The result here is a more streamlined workflow. I haven’t quantified its effect on completion time or drop-off.",
    next: "Compare completion by step, repeated requests for information and operations follow-ups to understand where friction remains.",
  },
};

const independentNotes: Record<string, Notes> = {
  hush: {
    question: "Can listening fit into the task someone is already doing?",
    decisions: [
      { title: "Start from the selection", detail: "A keyboard shortcut reads the selected passage in the current app. The floating player keeps voice, speed and sentence navigation close without requiring a separate reading workspace.", tradeoff: "Direct capture depends on what the app exposes through Accessibility; clipboard and paste remain alternatives." },
      { title: "Follow the original document", detail: "The reader can continue from the selection and wait for new text in the same accessible document. Switching tabs does not switch what it reads.", tradeoff: "Continuity requires tracking a stable text position and making interruptions visible." },
      { title: "Keep speech local", detail: "The installed app bundles its speech worker and model, with processing on the Mac after setup.", tradeoff: "Local operation brings packaging and model-size costs. The installed app is not a broadly distributed, notarized release." },
    ],
    limits: "An installed build and functional checks do not establish sustained use or an accessibility outcome. The newer follow-mode behavior still needs broader regression coverage.",
    next: "Test whether people finish the reading they intended, and how often capture errors or navigation interrupt them.",
  },
  "tff-harness": {
    question: "How can a person delegate work without losing the ability to intervene?",
    decisions: [
      { title: "Make autonomy explicit", detail: "Runs expose plans, approval requests and bounded grants. The person can steer, stop or resume the agent while preserving a record of the work.", tradeoff: "Frequent approval prompts can become friction; broad grants can hide consequential actions." },
      { title: "Review work before integration", detail: "Workers use isolated snapshots and changes are reviewed hunk by hunk before integration, with rollback available.", tradeoff: "Isolation and review add steps, but keep unfinished agent work from becoming an invisible change to the workspace." },
      { title: "Require evidence of completion", detail: "The harness records quality and safety checks and supports replayable evaluation scenarios.", tradeoff: "Passing a configured check proves only what that check covers; it is not a general guarantee of agent reliability." },
    ],
    limits: "This is a working prototype. No user study or measured productivity gain is claimed.",
    next: "Measure time spent reviewing, unnecessary approval interruptions and recovery from incorrect worker changes.",
  },
  yudhyantra: {
    question: "How much freedom can an AI character have while the experience remains explainable?",
    decisions: [
      { title: "Give each commander a bounded choice", detail: "Each island’s agent chooses from server-listed legal moves using its private view of the world. The player chairs a neutral council rather than commanding a combat side.", tradeoff: "A closed action set limits improvisation, but makes each decision compatible with the game’s rules." },
      { title: "Separate judgment from consequences", detail: "A separate arbiter returns typed judgments. A deterministic engine owns the numbers and the visible consequences.", tradeoff: "The simulation can still be poorly balanced even when its accounting is consistent." },
    ],
    limits: "Balance checks across 40 seeded mock matches are development evidence, not a player-engagement study or a model of real conflict.",
    next: "Test whether players can explain why events happened and whether council decisions feel consequential without becoming direct control.",
  },
  "ask-ankit": {
    question: "Can a portfolio answer a visitor’s specific question without asking them to search every page?",
    decisions: [
      { title: "Ground answers in authored notes", detail: "The assistant retrieves from a structured portfolio knowledge base, keeping answers tied to material about my work.", tradeoff: "Retrieval quality and freshness limit the answer. A fluent response is not a substitute for accurate notes." },
      { title: "Keep the scope narrow", detail: "Off-topic questions are rejected before model work, and the portfolio remains readable without opening the chat.", tradeoff: "A limited assistant answers fewer kinds of questions, but gives the experience a clear purpose." },
      { title: "Make service state visible", detail: "The chat includes an expandable backend and database health indicator, so infrastructure failures do not look like an unanswered personal question.", tradeoff: "A healthy backend and database do not verify the quality or availability of generated answers." },
    ],
    limits: "The assistant runs on this site. There is no measured improvement in recruiter conversion, and knowledge-base changes still need indexing before retrieval reflects them.",
    next: "Use unanswered and misunderstood questions to improve the notes and navigation, without collecting private information.",
  },
  "focus-play": {
    question: "Can a useful study session fit both the student’s available time and a viable cost to serve?",
    decisions: [
      { title: "Start with a goal and a time budget", detail: "The team’s product plan focused on time-pressed students. The prototype takes a goal, current knowledge and available time, then assembles short lessons from YouTube caption evidence.", tradeoff: "Useful source-supported teaching may not fill the requested budget. A shorter honest lesson is preferable to unsupported filler." },
      { title: "Let economics change the recommendation", detail: "The team compared a video stitcher, a trust layer and a general learning aid. The full AI-video concept was recommended no-go after cost and latency analysis; those conclusions are part of the product story, not a failed feature to hide.", tradeoff: "A compelling student need does not make an expensive generated-video experience commercially viable. The plan’s retention and helpfulness goals remain targets, not achieved results." },
      { title: "Prototype a cheaper teaching format", detail: "The local build uses narrated visuals, source references and practice questions. It can play prepared shorts while later ones are generated, preserve ready work after interruption and resume preparation.", tradeoff: "Local narration and diagrams reduce dependence on generated motion video, but do not establish that students learn more or will pay." },
      { title: "Show the source boundary", detail: "Search results lead to caption evidence; titles and snippets are not treated as teaching evidence. Missing evidence stops that part of the lesson. Source links and timestamps remain available.", tradeoff: "New lessons need external search and captions, and model review can miss errors. Saved-source checks cannot establish reliability on every new topic." },
    ],
    limits: "The product plan is team work; I built the local prototype. The plan recommends no-go on the full AI-video concept. Saved-source playback and provider checks demonstrate implementation, not pilot learning gains, retention or commercial viability.",
    next: "Test first-lesson wait, source faithfulness, completion within the intended budget and whether students choose a second session. Revisit economics before a broader launch.",
  },
};

export const caseStudies: CaseStudy[] = [
  ...workCases.map((item) => ({
    slug: item.href!.split("/").pop()!, title: item.title, meta: item.meta,
    summary: item.problem, role: item.role, evidence: item.outcome,
    visual: item.visual, caption: item.visualCaption, ...workNotes[item.id],
  })),
  ...projects.filter((item) => item.slug !== "heads-down").map((item) => ({
    slug: item.slug, title: item.name, meta: item.meta,
    summary: item.oneLiner, role: item.slug === "focus-play" ? "Built the local prototype; product concept and recommendation developed in a team project." : "Independent project — product exploration, design and implementation.",
    evidence: item.evidence, visual: item.visual, caption: "Illustrative product reconstruction",
    sourceUrl: item.sourceUrl, tryHref: item.slug === "ask-ankit" ? "/#ask" : undefined,
    ...independentNotes[item.slug],
  })),
];
