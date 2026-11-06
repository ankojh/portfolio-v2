import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { AoLogo, JaliBand } from "@/components/site/Brand";
import { Link } from "@/components/site/Link";
import { profile } from "@/data/profile";
import { recordResumeDownload } from "@/lib/api";
import { usePathname } from "@/lib/router";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Work", to: "/#work" },
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/#about" },
  { label: "Ask Ankit", to: "/#ask" },
];

export function ResumeLink({ className }: { className?: string }) {
  return (
    <a
      href={profile.resumeUrl}
      download
      onClick={() => recordResumeDownload(profile.resumeUrl)}
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border border-rule px-4 text-sm font-semibold text-ink transition-colors hover:border-ink",
        className,
      )}
    >
      Résumé
    </a>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="relative z-40 mx-auto flex w-full max-w-site items-center justify-between gap-6 px-5 py-3.5 sm:px-14 sm:py-[22px]">
      <Link to="/" className="flex min-h-11 items-center gap-3 text-ink" aria-label="Ankit Ojha, home">
        <AoLogo size={32} className="h-9 w-[54px] shrink-0" />
        <span className="text-[15px] font-semibold sm:text-base">Ankit Ojha</span>
      </Link>

      <nav aria-label="Primary" className="hidden items-center gap-[30px] md:flex">
        {navItems.map((item) => {
          const active = item.to === "/projects" && pathname === "/projects";
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "py-3 text-[15px] font-medium transition-colors hover:text-terra",
                item.label === "Ask Ankit" && "nav-ask",
                active ? "text-terra" : "text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <ResumeLink />
      </nav>

      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full border border-rule md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="absolute inset-x-5 top-full flex flex-col rounded-2xl border border-rule bg-paper p-2 shadow-ui md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-ink hover:bg-sand"
            >
              {item.label}
            </Link>
          ))}
          <ResumeLink className="m-2 justify-center" />
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto site-footer">
      <div className="footer-craft"><JaliBand height={30} /></div>
      <div className="mx-auto max-w-site border-t border-rule" />
      <div className="mx-auto flex max-w-site flex-wrap justify-between gap-3 px-5 pb-10 pt-7 text-[13.5px] text-quiet sm:px-14">
        <span>© {new Date().getFullYear()} Ankit Ojha · Always a work in progress.</span>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/#work" className="hover:text-terra">Work</Link>
          <Link to="/projects" className="hover:text-terra">Projects</Link>
          <a href={profile.socials.linkedin} className="hover:text-terra" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={profile.socials.github} className="hover:text-terra" target="_blank" rel="noreferrer">GitHub</a>
          <a href={`mailto:${profile.socials.email}`} className="hover:text-terra">Email</a>
        </nav>
      </div>
    </footer>
  );
}
