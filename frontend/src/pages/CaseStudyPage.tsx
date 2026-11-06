import { ArrowUpRight } from "lucide-react";

import { Link } from "@/components/site/Link";
import { VisualPanel } from "@/components/visuals/ProductVisuals";
import type { CaseStudy } from "@/content/caseStudies";

export function CaseStudyPage({ study }: { study: CaseStudy }) {
  return (
    <main id="main" className="page-width case-page">
      <nav aria-label="Back to work" className="case-breadcrumbs"><Link to="/#work">← Shipped work</Link><Link to="/projects">Independent projects ↗</Link></nav>
      <header className="case-header">
        <p className="section-kicker">{study.meta} / Product notes</p>
        <h1>{study.title}</h1>
        <p className="case-summary">{study.summary}</p>
      </header>
      <div className="case-opening">
        <div className="case-framing"><span className="section-kicker">The question worth asking</span><blockquote>{study.question}</blockquote><div className="case-ownership"><span className="section-kicker">My contribution</span><p>{study.role}</p></div></div>
        <figure><div className="case-visual"><VisualPanel visual={study.visual} /></div><figcaption className="visual-caption">{study.caption}</figcaption></figure>
      </div>
      <section className="case-decisions" aria-labelledby="decisions-heading">
        <div className="section-index"><span>01 / Decisions & tradeoffs</span></div>
        <h2 id="decisions-heading">Inside the thinking.</h2>
        {study.decisions.map((decision, index) => <article className="case-decision" key={decision.title}>
          <span className="case-number">0{index + 1}</span>
          <div><h3>{decision.title}</h3><p>{decision.detail}</p></div>
          <aside><span className="section-kicker">The tradeoff</span><p>{decision.tradeoff}</p></aside>
        </article>)}
      </section>
      <section className="case-evidence" aria-labelledby="evidence-heading">
        <div><p className="section-kicker">02 / Evidence so far</p><h2 id="evidence-heading">What I can point to.</h2><p>{study.evidence}</p></div>
        <div className="case-boundary"><p className="section-kicker">What remains unproven</p><p>{study.limits}</p></div>
      </section>
      <section className="case-next" aria-labelledby="next-heading"><p className="section-kicker">03 / The next question</p><h2 id="next-heading">What I’d evaluate next.</h2><p>{study.next}</p></section>
      <div className="case-links">
        <Link to="/projects" className="text-link">Explore more projects <ArrowUpRight size={16} aria-hidden="true" /></Link>
        {study.sourceUrl && <a href={study.sourceUrl} target="_blank" rel="noreferrer" className="text-link">View the source on GitHub <ArrowUpRight size={16} aria-hidden="true" /></a>}
        {study.tryHref && <Link to={study.tryHref} className="btn-ink">Try Ask Ankit <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </div>
    </main>
  );
}
