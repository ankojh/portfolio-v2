import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { navigate } from "@/lib/router";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** Internal link: plain <a href> for accessibility and new-tab support, SPA navigation on click. */
export function Link({ to, onClick, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  }

  return <a href={to} onClick={handleClick} {...props} />;
}
