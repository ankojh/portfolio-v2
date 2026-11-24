import { describe, expect, it } from "vitest";

import { caseStudies, workCases } from "./caseStudies";
import { projects } from "./site";

describe("project and case-study coverage", () => {
  it("keeps project and case-study routes unique", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
    expect(new Set(caseStudies.map(({ slug }) => slug)).size).toBe(caseStudies.length);
  });

  it.each(projects)("resolves $name to a case study or its dedicated Heads Down page", (project) => {
    expect(project.href).toBe(`/work/${project.slug}`);
    if (project.slug === "heads-down") return;
    expect(caseStudies.filter(({ slug }) => slug === project.slug)).toHaveLength(1);
  });

  it.each(workCases)("resolves the shipped-work link for $id", (project) => {
    expect(caseStudies.some(({ slug }) => project.href === `/work/${slug}`)).toBe(true);
  });

  it.each(caseStudies)("provides complete framing and decisions for $slug", (study) => {
    for (const value of [study.title, study.summary, study.role, study.question, study.evidence, study.limits, study.next]) {
      expect(typeof value).toBe("string");
      expect(value?.trim().length).toBeGreaterThan(0);
    }
    expect(Array.isArray(study.decisions)).toBe(true);
    expect(study.decisions?.length).toBeGreaterThan(0);
    for (const decision of study.decisions ?? []) {
      for (const value of [decision.title, decision.detail, decision.tradeoff]) {
        expect(typeof value).toBe("string");
        expect(value?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it.each(["dor", "transformer"])("includes %s in discovery and the case-study collection", (slug) => {
    const project = projects.find((project) => project.slug === slug);
    const study = caseStudies.find((study) => study.slug === slug);
    expect(project).toBeDefined();
    expect(project?.filters).toContain("AI products");
    expect(study).toBeDefined();
    expect(study?.title).toBe(project?.name);
    expect(study?.sourceUrl).toBe(`https://github.com/ankojh/${slug}`);
  });
});
