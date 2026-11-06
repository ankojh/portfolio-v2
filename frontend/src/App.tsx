import { useEffect } from "react";

import { AppToast } from "@/components/AppToast";
import { Link } from "@/components/site/Link";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { useToast } from "@/hooks/useToast";
import { useInitialHashScroll, usePathname } from "@/lib/router";
import { HeadsDownCaseStudy } from "@/pages/HeadsDownCaseStudy";
import { HomePage } from "@/pages/HomePage";
import { caseStudies } from "@/content/caseStudies";
import { CaseStudyPage } from "@/pages/CaseStudyPage";
import { ProjectsPage } from "@/pages/ProjectsPage";

const titles: Record<string, string> = {
  "/": "Ankit Ojha — Product, applied AI, engineering",
  "/work/heads-down": "Heads Down case study — Ankit Ojha",
  "/projects": "Projects — Ankit Ojha",
};

function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-site flex-1 flex-col items-start px-5 py-24 sm:px-14">
      <div className="label">Not found</div>
      <h1 className="display mt-4 text-[40px] sm:text-[56px]">This page doesn’t exist.</h1>
      <Link to="/" className="btn-ink mt-8">Back to the homepage</Link>
    </main>
  );
}

export function App() {
  const pathname = usePathname();
  const { toastMessage, showToast } = useToast();
  useInitialHashScroll();
  const study = caseStudies.find((item) => pathname === `/work/${item.slug}`);

  useEffect(() => {
    document.title = titles[pathname] ?? (study ? `${study.title} — Ankit Ojha` : "Not found — Ankit Ojha");
  }, [pathname, study]);

  let page;
  if (pathname === "/") {
    page = <HomePage onError={showToast} />;
  } else if (pathname === "/work/heads-down") {
    page = <HeadsDownCaseStudy />;
  } else if (pathname === "/projects") {
    page = <ProjectsPage />;
  } else if (study) {
    page = <CaseStudyPage study={study} />;
  } else {
    page = <NotFound />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-ground text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-ground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      {page}
      <SiteFooter />
      <AppToast message={toastMessage} />
    </div>
  );
}
