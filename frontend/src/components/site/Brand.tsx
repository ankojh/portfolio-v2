import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { EvidenceKind } from "@/content/site";

/** An asymmetric infinity ribbon with a small over-under crossing. */
export function AoLogo({ size = 36, className }: { size?: number; className?: string }) {
  const crossingId = useId();
  return (
    <svg viewBox="0 0 96 64" width={size * 1.5} height={size} className={className} role="img" aria-label="Ankit’s woven infinity mark">
      <defs><mask id={crossingId} maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="64">
        <rect width="96" height="64" fill="white" />
        <path d="M40.678 38.487 C43.962 35.324 47.330 31.567 50.861 27.485" fill="none" stroke="black" strokeWidth="10" strokeLinecap="round" />
      </mask></defs>
      <g fill="none" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M48 32 C36 18 26 12 16 17 C0 25 5 46 20 48 C31 50 41 39 53 25 C65 11 78 10 87 20 C100 36 88 54 74 48 C65 44 57 40 48 32Z" stroke="currentColor" mask={`url(#${crossingId})`} />
        <path d="M40.678 38.487 C43.962 35.324 47.330 31.567 50.861 27.485" stroke="#a4452d" />
      </g>
    </svg>
  );
}

/** A floral block-print-inspired accent, used as a divider rather than an emblem. */
export function PrintFlower({ className }: { className?: string }) {
  return <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
    {Array.from({ length: 8 }, (_, i) => <path key={i} d="M32 27 C20 18 28 8 32 5 C36 8 44 18 32 27Z" transform={`rotate(${i * 45} 32 32)`} />)}
    <circle cx="32" cy="32" r="4" /><circle cx="32" cy="32" r="1" fill="currentColor" />
  </svg>;
}

const dotClass: Record<EvidenceKind, string> = {
  // Shape, not just color, distinguishes the three evidence levels.
  shipped: "bg-ink",
  prototype: "border border-ink bg-[linear-gradient(90deg,#1E1A16_50%,#FFFCF7_50%)]",
  hypothesis: "border-[1.5px] border-ink",
};

export function EvidenceBadge({
  kind,
  label,
  className,
}: {
  kind: EvidenceKind;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border border-rule bg-paper px-[11px] py-[7px] text-[12.5px] font-medium leading-none text-body",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", dotClass[kind])} />
      {label}
    </span>
  );
}

/** Small uppercase section label with an optional leading rule. */
export function Eyebrow({
  children,
  rule = false,
  className,
}: {
  children: ReactNode;
  rule?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("label flex items-center gap-2.5", className)}>
      {rule && <span aria-hidden="true" className="inline-block h-px w-7 bg-terra" />}
      {children}
    </div>
  );
}

const ARCH_PATHS = {
  tall: "M0 100 L0 34 L0.30 30.64 L1.19 27.32 L2.66 24.06 L4.70 20.89 L7.30 17.84 L10.42 14.94 L14.04 12.22 L18.12 9.70 L22.63 7.41 L27.53 5.37 L32.76 3.59 L38.29 2.09 L44.05 0.89 L50 0 L55.95 0.89 L61.71 2.09 L67.24 3.59 L72.47 5.37 L77.37 7.41 L81.88 9.70 L85.96 12.22 L89.58 14.94 L92.70 17.84 L95.30 20.89 L97.34 24.06 L98.81 27.32 L99.70 30.64 L100 34 L100 100",
  wide: "M0 100 L0 30 L0.30 27.04 L1.19 24.11 L2.66 21.23 L4.70 18.43 L7.30 15.74 L10.42 13.19 L14.04 10.78 L18.12 8.56 L22.63 6.54 L27.53 4.74 L32.76 3.17 L38.29 1.85 L44.05 0.79 L50 0 L55.95 0.79 L61.71 1.85 L67.24 3.17 L72.47 4.74 L77.37 6.54 L81.88 8.56 L85.96 10.78 L89.58 13.19 L92.70 15.74 L95.30 18.43 L97.34 21.23 L98.81 24.11 L99.70 27.04 L100 30 L100 100",
  low: "M0 100 L0 24 L0.30 21.63 L1.19 19.28 L2.66 16.98 L4.70 14.74 L7.30 12.59 L10.42 10.55 L14.04 8.63 L18.12 6.85 L22.63 5.23 L27.53 3.79 L32.76 2.53 L38.29 1.48 L44.05 0.63 L50 0 L55.95 0.63 L61.71 1.48 L67.24 2.53 L72.47 3.79 L77.37 5.23 L81.88 6.85 L85.96 8.63 L89.58 10.55 L92.70 12.59 L95.30 14.74 L97.34 16.98 L98.81 19.28 L99.70 21.63 L100 24 L100 100",
} as const;

/**
 * Jharokha frame: the site's one architectural signature. A low pointed arch
 * clips a sandstone panel, with a fine inset outline like carved stone.
 */
export function ArchFrame({
  shape = "tall",
  className,
  outline = true,
  children,
}: {
  shape?: keyof typeof ARCH_PATHS;
  className?: string;
  outline?: boolean;
  children?: ReactNode;
}) {
  const clip = shape === "tall" ? "arch-tall" : shape === "wide" ? "arch-wide" : "arch-low";
  return (
    <div className={cn("relative bg-stone", clip, className)}>
      {outline && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-3.5 top-3.5 h-[calc(100%-28px)] w-[calc(100%-28px)]"
        >
          <path
            d={ARCH_PATHS[shape]}
            fill="none"
            stroke="#B0694B"
            strokeOpacity="0.5"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {children}
    </div>
  );
}

/** Jali-inspired lattice, with a unique pattern id at each placement. */
export function JaliBand({ height = 56 }: { height?: number }) {
  const patternId = useId();
  return (
    <svg aria-hidden="true" width="100%" height={height} className="jali-band">
      <defs>
        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#C9A383" strokeWidth="1">
            <path d="M14 4.5 L23.5 14 L14 23.5 L4.5 14 Z" />
            <path d="M7.3 7.3 H20.7 V20.7 H7.3 Z" />
            <path d="M14 0 V4.5 M14 23.5 V28 M0 14 H4.5 M23.5 14 H28" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${patternId})`} />
    </svg>
  );
}
