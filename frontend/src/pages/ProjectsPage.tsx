import { useState } from "react";

import { EvidenceBadge, Eyebrow } from "@/components/site/Brand";
import { Link } from "@/components/site/Link";
import { HeadsDownMini, VisualPanel } from "@/components/visuals/ProductVisuals";
import { type Project, type ProjectFilter, evidenceKey, projectFilters, projects } from "@/content/site";
import { cn } from "@/lib/utils";

type Filter = "All" | ProjectFilter;

const projectEvidenceKey = evidenceKey.map((tag) =>
  tag.kind === "shipped"
    ? { ...tag, label: "Built and running" }
    : tag.kind === "hypothesis"
      ? { ...tag, label: "Experiment" }
      : tag,
);

function ProjectFacts({ project }: { project: Project }) {
  const rows: Array<[string, string]> = [
    ["Product question", project.productQuestion],
    ["Principle", project.principle],
    [project.slug === "heads-down" ? "Evidence" : "What exists", project.evidence],
    ["Stack", project.stack],
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-[14.5px] leading-[1.55] sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-y-2">
      {rows.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="pt-[3px] text-xs font-semibold uppercase tracking-[0.06em] text-terra">{term}</dt>
          <dd className={cn("mb-2 text-[#3F372F] sm:mb-0", term === "Stack" && "text-quiet")}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProjectLink({ project }: { project: Project }) {
  if (!project.href) {
    return null;
  }
  const label = project.href.startsWith("/work/") ? "Read the case study" : "Try it";
  return (
    <Link to={project.href} className="text-link">
      {label} <span aria-hidden="true">→</span>
    </Link>
  );
}

export function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = projects.filter((project) => filter === "All" || project.filters.includes(filter));
  const [featured, ...rest] = visible;
  const featuredHasCase = featured?.href?.startsWith("/work/");
  const gridProjects = featuredHasCase ? rest : visible;

  return (
    <main id="main" className="mx-auto w-full max-w-site px-5 pb-20 pt-6 sm:px-14 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-[720px]">
          <Eyebrow>Projects · {projects.length}</Eyebrow>
          <h1 className="display mt-[18px] text-[40px] leading-[1.05] tracking-[-0.022em] sm:text-[64px]">Things I build to learn by shipping.</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body sm:text-[19px]">
            Independent products, each built to answer one product question. Each has a case study covering the decisions, tradeoffs and evidence so far.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Evidence key">
          {projectEvidenceKey.map((tag) => (
            <EvidenceBadge key={tag.kind} kind={tag.kind} label={tag.label} />
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-[18px] sm:mt-12">
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {(["All", ...projectFilters] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                filter === option ? "border-ink bg-ink text-ground" : "border-[#D5C6AE] text-ink hover:border-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <span className="text-sm text-quiet" aria-live="polite">
          {visible.length} {visible.length === 1 ? "project" : "projects"} · independent work
        </span>
      </div>

      {featured && featuredHasCase && (
        <article id={featured.slug} className="mt-10 flex flex-wrap overflow-hidden rounded-3xl bg-sand">
          <div className="relative min-h-[300px] min-w-0 flex-[1_1_520px] bg-[#E9DDCA] sm:min-h-[420px]">
            {featured.slug === "heads-down" ? <HeadsDownMini tall /> : <VisualPanel visual={featured.visual} />}
          </div>
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4 px-6 py-8 sm:px-11 sm:py-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Eyebrow>{featured.meta}</Eyebrow>
              <EvidenceBadge kind={featured.status.kind} label={featured.status.label} />
            </div>
            <h2 className="display text-[32px] leading-tight sm:text-[40px]">{featured.name}</h2>
            <p className="text-[17px] leading-relaxed text-[#3F372F]">{featured.oneLiner}</p>
            <ProjectFacts project={featured} />
            <ProjectLink project={featured} />
          </div>
        </article>
      )}

      <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-2">
        {gridProjects.map((project) => (
          <article key={project.slug} id={project.slug} className="flex flex-col rounded-[22px] border border-[#E4D9C7] bg-paper p-3.5 pb-7">
            <div className="relative h-[220px] overflow-hidden rounded-xl bg-clay">
              <VisualPanel visual={project.visual} />
            </div>
            <div className="flex flex-col gap-3.5 px-3 pt-[22px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Eyebrow>{project.meta}</Eyebrow>
                <EvidenceBadge kind={project.status.kind} label={project.status.label} />
              </div>
              <h2 className="display text-[28px] sm:text-[32px]">{project.name}</h2>
              <p className="text-base leading-relaxed text-[#3F372F]">{project.oneLiner}</p>
              <ProjectFacts project={project} />
              <ProjectLink project={project} />
            </div>
          </article>
        ))}
      </div>

      <section className="mt-20 sm:mt-[88px]" aria-labelledby="index-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Index</Eyebrow>
            <h2 id="index-heading" className="display mt-3 text-[30px] sm:text-4xl">Everything, at a glance</h2>
          </div>
          <span className="text-sm text-quiet">New experiments land here first.</span>
        </div>
        <div className="mt-6">
          <table className="project-index-table border-collapse text-[15px]">
            <thead>
              <tr className="text-left">
                {["Project", "Explores", "Status"].map((heading) => (
                  <th key={heading} scope="col" className="label border-b border-ink px-3 py-3 text-[11px] first:pl-0">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.slug} className="border-b border-rule">
                  <td className="py-[18px] pr-3 font-semibold">
                    {project.href ? (
                      <Link to={project.href} className="hover:text-terra">{project.name}</Link>
                    ) : (
                      <a href={`#${project.slug}`} className="hover:text-terra">{project.name}</a>
                    )}
                    <span className="index-date">{project.month}</span>
                  </td>
                  <td className="px-3 py-[18px] text-body">{project.explores}</td>
                  <td className="px-3 py-[18px]">
                    <EvidenceBadge kind={project.indexStatus.kind} label={project.indexStatus.label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
