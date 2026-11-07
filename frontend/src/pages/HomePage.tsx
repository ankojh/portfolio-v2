import { ArrowDown, ArrowUpRight, Check, MessageCircle } from "lucide-react";

import { WorthBuilding } from "@/components/WorthBuilding";
import { AskAnkit } from "@/components/AskAnkit";
import { AoLogo, EvidenceBadge, JaliBand, PrintFlower } from "@/components/site/Brand";
import { Link } from "@/components/site/Link";
import { VisualPanel } from "@/components/visuals/ProductVisuals";
import { about, education, engineeringDepth, experience, featuredCase, projects } from "@/content/site";
import { workCases } from "@/content/caseStudies";
import { profile } from "@/data/profile";

const [leadProject, ...independentProjects] = projects;

export function HomePage({ onError }: { onError: (message: string) => void }) {
  return (
    <main id="main" className="home-page">
      <section className="home-intro page-width" aria-labelledby="intro-heading">
        <div className="intro-main">
          <p className="section-kicker"><span className="status-dot" /> A builder’s path into product</p>
          <h1 id="intro-heading">Hi, I’m Ankit.<br />I care about<br /><WorthBuilding /></h1>
          <p className="intro-description">I turn messy workflows into clear priorities and shipped products — at <strong>Pulley, Mochi Health and Zoho.</strong> I’m moving into product management, and I bring eight years as a senior full-stack engineer: I know what a decision costs to build before the team commits to it.</p>
          <div className="intro-links">
            <a href="#work" className="text-link">A few decisions I’ve helped ship <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
        </div>
        <aside className="intro-personal" aria-label="A little context">
          <div className="portrait-surround"><div className="portrait-lattice"><JaliBand height={210} /></div><figure className="portrait-note">
            <img src={profile.photoUrl} width={560} height={560} alt="Ankit Ojha by the Golden Gate Bridge" />
            <figcaption>Me, by the GG.</figcaption>
          </figure><PrintFlower className="portrait-flower" /></div>
          <div className="ask-invitation">
            <a href="#ask" className="ask-invitation-title"><MessageCircle size={19} aria-hidden="true" /><span>Ask Ankit</span><ArrowUpRight size={16} aria-hidden="true" /></a>
            <p>My notes. Your questions.</p>
          </div>
        </aside>
      </section>

      <section id="work" className="page-width work-section" aria-label="Selected work">
        <div className="section-index"><span>01 / Decisions, shipped</span><span>Problem → choice → evidence</span></div>
        <article id="valuation" className="valuation-feature">
          <div className="valuation-overview">
            <div className="feature-meta"><span>Pulley / Valuation platform</span><span><Check size={13} aria-hidden="true" /> Shipped</span></div>
            <h2>From days<br />to <span>~2 hours.</span></h2>
            <p className="feature-description">Turning a manual valuation process into a repeatable workflow for expert analysts.</p>
            <div className="feature-result"><strong>1,800+</strong><span>valuations in the first year<br />Team results after launch</span></div>
          </div>
          <div className="workflow-panel">
            <div className="workflow-heading"><span>The product decision</span><span>Field note / 01</span></div>
            <h3 className="decision-headline">Automate the repetition.<br /><em>Keep the judgment.</em></h3>
            <dl className="decision-notes">
              <div><dt>The friction</dt><dd>Each valuation repeated expert analyst work across a series of manual steps.</dd></div>
              <div><dt>The choice</dt><dd>Structure the inputs, review states and report generation into one repeatable workflow.</dd></div>
              <div><dt>The boundary</dt><dd>Analysts still own the judgment calls. The software supports their expertise.</dd></div>
            </dl>
          </div>
          <div className="feature-role"><span>My contribution</span><p>{featuredCase.role}</p></div>
          <details className="feature-details">
            <summary>Read the reasoning <span aria-hidden="true">+</span></summary>
            <div><p>{featuredCase.problem}</p><p><strong>The decision:</strong> {featuredCase.bet}</p></div>
          </details>
          <Link to={featuredCase.href!} className="feature-case-link text-link">Read the case study <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </article>

        <div className="supporting-work">
          {workCases.slice(1).map((item, index) => (
            <article key={item.id} className="work-entry">
              <div className="work-entry-top"><span>0{index + 2}</span><span>{item.meta}</span></div>
              <div className="work-visual"><VisualPanel visual={item.visual} /></div>
              <p className="visual-caption">{item.visualCaption}</p>
              <h2>{item.title}</h2>
              <p className="work-problem">{item.problem}</p>
              <div className="work-decision"><span>The product bet</span><p>{item.bet}</p></div>
              <div className="work-outcome"><span>{item.outcomeLabel ?? "What changed"}</span><p>{item.outcome}</p></div>
              <p className="work-role"><strong>My role</strong> {item.role}</p>
              <div className="work-entry-footer">
                {item.tags.map((tag) => <EvidenceBadge key={tag.label} kind={tag.kind} label={tag.label} />)}
                {item.href && <Link to={item.href} className="text-link">Inside the project <ArrowUpRight size={16} aria-hidden="true" /></Link>}
              </div>
            </article>
          ))}
        </div>


      </section>

      <section className="project-section" aria-labelledby="projects-heading">
        <div className="page-width">
          <div className="section-index"><span>02 / The side of my desk</span><span>Questions turned into prototypes</span></div>
          <div className="section-title-row"><PrintFlower className="desk-flower" /><div><h2 id="projects-heading">I think better when I can try it.</h2><p>These are my small bets on how people could work with AI.</p></div><Link to="/projects" className="text-link">All projects <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
          <article className="desk-lead">
            <div className="desk-lead-visual"><VisualPanel visual={leadProject.homeVisual} /></div>
            <div className="desk-lead-copy">
              <p className="section-kicker">First on my desk / {leadProject.status.label}</p>
              <h3>{leadProject.name}</h3>
              <p>{leadProject.pitch}</p>
              <blockquote>{leadProject.productQuestion}</blockquote>
              <Link to={leadProject.href!} className="text-link">Inside Heads Down <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
          </article>
          <p className="visual-caption">Illustrative product reconstructions throughout this section</p>
          <div className="experiment-list">
            {independentProjects.map((project, index) => (
              <Link to={project.href!} className="experiment" key={project.slug}>
                <span className="experiment-number">0{index + 2}</span>
                <div><h3>{project.name}</h3><p>{project.pitch}</p><p className="experiment-question"><span>The question</span> {project.productQuestion}</p><span className="experiment-status">{project.status.label} · {project.meta.split(" · ").slice(1).join(" · ")}</span></div>
                <div className="experiment-thumb" aria-hidden="true"><div><VisualPanel visual={project.homeVisual} /></div></div>
                <ArrowUpRight size={22} className="experiment-arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="engineering" className="page-width engineering-section" aria-labelledby="engineering-heading">
        <div className="section-index"><span>03 / The engineering underneath</span><span>{engineeringDepth.credential}</span></div>
        <div className="engineering-intro">
          <h2 id="engineering-heading">{engineeringDepth.headline}<br /><em>{engineeringDepth.emphasis}</em></h2>
          <p>{engineeringDepth.body}</p>
        </div>
        <ol className="engineering-list">
          {engineeringDepth.items.map((item, index) => (
            <li key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <p className="engineering-product"><strong>For the product</strong> {item.forProduct}</p>
            </li>
          ))}
        </ol>
        <p className="engineering-stack"><span>Day to day</span> {engineeringDepth.stack}</p>
      </section>

      <section id="about" className="page-width about-section" aria-labelledby="about-heading">
        <div className="section-index"><span>04 / The person behind the work</span></div>
        <div className="about-layout">
          <div className="about-aside"><AoLogo size={64} className="h-16 w-24 shrink-0 text-terra" /><p>{about.personal}</p></div>
          <div className="about-copy">
            <h2 id="about-heading">Closer to the problem.<br /><em>Still close to the build.</em></h2>
            <p>At Pulley, I worked with product and design on new products. At Mochi Health, I joined discovery with operations and introduced analytics to help the team decide what to fix next. That’s the work I want to do more of.</p>
            <p>I’m moving into product management with the perspective of someone who has built, shipped and maintained the software. I care about whether the decision makes sense for the person using it, and what it takes to make it real.</p>

            <a className="text-link" href={profile.resumeUrl} target="_blank" rel="noreferrer">The longer story, in my résumé <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="background-history">
            <ol className="experience-list">{experience.filter((item) => item.title).map((item) => <li key={item.org}><span>{item.years}</span><h3>{item.org}</h3><p className="experience-title">{item.title}</p><p>{item.focus}</p></li>)}</ol>
            <section className="education-history" aria-labelledby="education-heading">
              <h3 id="education-heading">Education</h3>
              <div><span>Currently pursuing</span><h4>{education.institution}</h4><p>{education.degree} ({education.abbreviation})</p></div>
              {experience.filter((item) => !item.title).map((item) => <div key={item.org}><span>{item.years}</span><h4>{item.org}</h4><p>{item.focus}</p></div>)}
            </section>
          </div>
        </div>
      </section>

      <section id="contact" className="page-width contact-section" aria-labelledby="contact-heading">
        <div className="contact-copy"><p className="section-kicker">Let’s talk</p><h2 id="contact-heading">Let’s talk about<br /><em>the hard part.</em></h2><p>I’m looking for product management opportunities in workflow software and applied AI. If your team is untangling a difficult problem, I’d love to compare notes.</p><a className="btn-ink" href={`mailto:${profile.socials.email}`}>Email me <ArrowUpRight size={16} aria-hidden="true" /></a><div className="social-links"><a href={profile.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={profile.socials.github} target="_blank" rel="noreferrer">GitHub ↗</a></div></div>
        <div id="ask" className="contact-chat"><AskAnkit onError={onError} /></div>
      </section>
    </main>
  );
}
