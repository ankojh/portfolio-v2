import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * Shared pieces for the illustrations a visitor can operate. The controls are real
 * buttons, so they live outside the aria-hidden artwork and each illustration exposes a
 * short description instead of a role="img" label. Every state is a complete still:
 * nothing here needs motion to be readable.
 */

/** A control that belongs to the illustration it sits in; `pressed` marks a chosen option. */
export function SceneChoice({ pressed, onClick, className, children }: {
  pressed?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={cn("scene-choice", className)}>
      {children}
    </button>
  );
}

/** A labelled set of choices, announced as one group. */
export function SceneChoices({ label, legend, className, children }: {
  label: string;
  legend?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className={cn("scene-choices", className)}>
      {legend && <span aria-hidden="true">{legend}</span>}
      {children}
    </div>
  );
}

/** What the illustration now shows, in words — read by everyone, announced on change. */
export function SceneNote({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("scene-note", className)} aria-live="polite">{children}</p>;
}
