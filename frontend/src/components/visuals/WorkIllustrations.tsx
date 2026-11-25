import type { ReactNode } from "react";
import { Check, FileText, Mail, ShieldCheck, Undo2, UserRound } from "lucide-react";

import { SceneChoice, SceneNote } from "@/components/visuals/SceneControls";
import { useSceneChoice } from "@/components/visuals/sceneControl";

type WorkKind = "valuation-review" | "license-states" | "offer-flow" | "comms-flow" | "physician-flow" | "credential-flow" | "onboarding-flow";
function PaperLines({ className = "" }: { className?: string }) {
  return <div className={`paper-lines ${className}`}><i /><i /><i /></div>;
}
/**
 * A still illustration is one image with one description. An operable one keeps its
 * artwork hidden from assistive technology but leaves its controls in the page, so the
 * description is read out instead of a role="img" label.
 */
function WorkStage({ kind, label, description, children, operable = false }: { kind: WorkKind; label: string; description: string; children: ReactNode; operable?: boolean }) {
  const caption = `Conceptual illustration: ${description}`;
  return <div className={`work-illustration work-illustration--${kind}`} {...(operable ? {} : { role: "img", "aria-label": caption })}>
    {operable && <p className="sr-only">{caption}</p>}
    <div className="work-stage" {...(operable ? {} : { "aria-hidden": true })}><div className="work-scene-label" aria-hidden="true"><span>{label}</span><span>Illustration</span></div>{children}</div>
  </div>;
}

/* Mochi’s product decision was that a wrong record must be correctable in the workflow,
 * and that the correction stays on the record. Both directions are available, because the
 * point is the way back — not a happy path that only runs forwards. */
function LicenseRecord() {
  const { value: status, touched, choose } = useSceneChoice<"active" | "expired">("active");
  const history = !touched ? "Correction saved in history" : status === "active" ? "Restored to active · saved in history" : "Marked expired · saved in history";
  const note = !touched
    ? "Correct the record without an engineering ticket."
    : status === "expired"
      ? "The status is wrong now — and there is still a way back."
      : "Restored, with the correction kept on the record.";
  return <WorkStage kind="license-states" label="A mistake with a way back" operable
    description="a sample provider license whose status you can set to expired and restore to active, with each change kept in the record’s history">
    <div className="license-record" data-status={status}>
      <div className="license-person" aria-hidden="true"><span className="work-avatar"><UserRound size={18} /></span><div><strong>Provider license</strong><small>Example record</small></div><ShieldCheck size={21} /></div>
      <div className="license-state" aria-hidden="true"><span>Status</span><div className="license-state-pair"><b className="license-wrong">Expired · incorrect</b><b className="license-correct">Active · restored</b></div></div>
      <div className="license-action">
        <SceneChoice className="restore-action" onClick={() => choose(status === "active" ? "expired" : "active")}>
          <Undo2 size={12} aria-hidden="true" /> {status === "active" ? "Set to expired" : "Restore status"}
        </SceneChoice>
        <span className="license-history" aria-hidden="true"><Check size={11} /> {history}</span>
      </div>
    </div>
    <SceneNote className="work-scene-note">{note}</SceneNote>
  </WorkStage>;
}

export function WorkIllustration({ kind }: { kind: WorkKind }) {
  switch (kind) {
    case "valuation-review":
      return <WorkStage kind={kind} label="The analyst’s desk" description="Structured inputs fill a valuation report, which remains ready for an analyst’s judgment."><div className="valuation-desk"><div className="input-sheet"><span className="work-small-label">Structured inputs</span>{["Cap table", "Latest round", "Comparables"].map((name,i)=><div className={`input-row work-delay-${i}`} key={name}><span>{name}</span><Check size={12} /></div>)}</div><div className="valuation-paper"><span className="work-small-label">Valuation report</span><div className="valuation-bars"><i /><i /><i /><i /><i /></div><PaperLines /><span className="analyst-seal">Ready for analyst review</span></div></div><p className="work-scene-note">The report takes shape. The judgment stays human.</p></WorkStage>;
    case "license-states":
      return <LicenseRecord />;
    case "offer-flow":
      return <WorkStage kind={kind} label="An offer, taking shape" description="Role and equity terms become highlighted clauses in an offer letter, followed by a signature line and prepared seal."><div className="offer-desk"><div className="offer-terms"><span className="work-small-label">The agreed terms</span><div><small>Role</small><strong>Product Engineer</strong></div><div><small>Equity</small><strong>Agreed grant</strong></div></div><div className="offer-letter"><FileText size={16} /><h4>An offer to build with us.</h4><p>We’re pleased to offer you the role of <mark className="offer-clause clause-role">Product Engineer</mark>, with <mark className="offer-clause clause-equity">your agreed equity grant.</mark></p><span className="offer-signature">With excitement,</span><span className="offer-seal">Offer prepared ✓</span></div></div></WorkStage>;
    case "comms-flow":
      return <WorkStage kind={kind} label="The investor edition" description="Company context and highlights are composed into an investor update, then tucked into a ready-to-share envelope."><div className="comms-desk"><div className="company-snippets"><div className="company-snippet"><span>Company data</span><div className="snippet-chart"><i /><i /><i /><i /></div></div><div className="company-snippet"><span>Team highlights</span><PaperLines /></div></div><div className="update-edition"><span className="work-small-label">Investor update</span><h4>Here’s what<br />we’re building.</h4><PaperLines className="update-paragraph" /></div><div className="update-envelope"><Mail size={15} /><span>Ready to share</span></div></div></WorkStage>;
    case "physician-flow":
      return <WorkStage kind={kind} label="Room for a larger care team" description="A supervising physician anchors a shared team roster as nurse practitioner profile cards fan into view. This is a relationship illustration, not patient data."><div className="care-team"><div className="physician-anchor"><span className="work-avatar"><UserRound size={22} /></span><div><strong>Supervising physician</strong><small>One shared team roster</small></div></div><div className="practitioner-roster">{["A", "B", "C"].map((name,i)=><div className={`practitioner practitioner-${i}`} key={name}><span className="work-avatar"><UserRound size={17} /></span><strong>Practitioner {name}</strong><small>Nurse practitioner</small><span><Check size={10} /> Assigned</span></div>)}</div></div><p className="work-scene-note">Support the relationship, as the team grows.</p></WorkStage>;
    case "credential-flow":
      return <WorkStage kind={kind} label="Carry the records. Keep the trust." description="A stack of source records is reconciled against a credential ledger. A scan passes over provider, license and insurance rows, leaving matching checks."><div className="credential-desk"><div className="record-stack"><span className="record-back"/><span className="record-middle"/><div className="record-front"><FileText size={22}/><strong>Existing<br/>records</strong><PaperLines/></div></div><div className="credential-ledger"><span className="work-small-label">Credential ledger</span>{["Provider details", "License record", "Insurance data"].map((name,i)=><div key={name} className={`ledger-row work-delay-${i}`}><span>{name}</span><Check size={12}/></div>)}<span className="ledger-scanner"/><span className="ledger-seal"><ShieldCheck size={13}/> Records reconciled</span></div></div></WorkStage>;
    case "onboarding-flow":
      return <WorkStage kind={kind} label="A proper welcome, inside the portal" description="A provider’s profile and credentials are filled directly in the portal, then checked as ready for review, rather than collected in disconnected forms."><div className="onboarding-portal"><aside><span className="portal-monogram">M</span><i/><i/><i/></aside><div className="portal-form"><div className="portal-welcome"><span className="work-avatar"><UserRound size={18}/></span><div><strong>Welcome to your portal</strong><small>Let’s get your profile ready.</small></div></div><div className="portal-fields">{[["Name", "Provider profile"],["Role", "Nurse practitioner"],["Credentials", "Documents attached"]].map(([label,value],i)=><div key={label} className={`portal-field work-delay-${i}`}><span>{label}</span><strong>{value}</strong><Check size={11}/></div>)}</div><span className="portal-ready"><Check size={12}/> Ready for review</span></div></div></WorkStage>;
  }
}
