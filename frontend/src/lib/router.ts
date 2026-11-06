import { useEffect, useSyncExternalStore } from "react";

/*
 * A small client-side router for the portfolio and its case studies. Paths use the History API so URLs stay shareable; Vercel
 * rewrites every unknown path to index.html (see vercel.json).
 */

const NAVIGATE_EVENT = "app:navigate";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

function getPathname() {
  return normalizePath(window.location.pathname);
}

export function normalizePath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname, () => "/");
}

export function navigate(to: string) {
  const url = new URL(to, window.location.origin);
  const samePage = normalizePath(url.pathname) === getPathname();
  window.history.pushState(null, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));

  if (url.hash) {
    // Wait for the destination page to render before scrolling to the anchor.
    requestAnimationFrame(() => scrollToHash(url.hash));
  } else if (!samePage) {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }
}

export function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  const target = id ? document.getElementById(id) : null;
  target?.scrollIntoView({ block: "start" });
}

/** Scrolls to the URL hash on first load (e.g. a shared link to /#work). */
export function useInitialHashScroll() {
  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash));
    }
  }, []);
}
