import { useRef, useState } from "react";

export function WorthBuilding() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <span
      className="worth-building"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (document.activeElement !== trigger.current) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="worth-trigger"
        aria-describedby="worth-building-note"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
      >
        <em>what’s worth building.</em>
      </button>
      <span id="worth-building-note" role="tooltip" className="worth-tooltip" hidden={!open}>
        Because every feature asks for someone’s time. I want to understand whose problem we’re solving, why it matters, and what a better outcome would look like before we commit.
      </span>
    </span>
  );
}
