import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";

// lucide's "X" icon is a close-cross, not the X brand mark, so inline the logo.
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

// Legacy clipboard path for insecure contexts where navigator.clipboard is
// unavailable. Returns true if the copy command was accepted.
function legacyCopy(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

const links = [
  { href: profile.socials.github, label: "GitHub", Icon: Github },
  { href: profile.socials.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: profile.socials.x, label: "X", Icon: XLogo },
];

const copyButtons = [
  {
    value: profile.socials.email,
    label: "Copy email address",
    toast: "Email address copied to clipboard",
    Icon: Mail,
  },
];

export function SocialLinks() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000);
  }

  async function copyToClipboard(value: string, message: string) {
    // navigator.clipboard only exists in secure contexts (https/localhost);
    // fall back to a temporary textarea + execCommand otherwise.
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else if (!legacyCopy(value)) {
        throw new Error("copy unsupported");
      }
      showToast(message);
    } catch {
      showToast("Couldn't copy — please copy manually");
    }
  }

  return (
    <>
      {links.map(({ href, label, Icon }) => (
        <Button key={label} asChild variant="ghost" size="icon">
          <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon className="size-4" />
          </a>
        </Button>
      ))}
      {copyButtons.map(({ value, label, toast, Icon }) => (
        <Button
          key={label}
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={() => copyToClipboard(value, toast)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground shadow-md"
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
