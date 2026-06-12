import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { introCards, profile, type IntroCard } from "@/data/profile";

const MAX_VISIBLE = 3;

export function IntroCards({
  activeIndex,
  onAdvance,
  onSkip,
}: {
  activeIndex: number;
  onAdvance: () => void;
  onSkip: () => void;
}) {
  const total = introCards.length;
  const isLast = activeIndex === total - 1;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
      <div className="relative h-[420px] w-full max-w-md">
        {introCards.map((card, index) => {
          const offset = index - activeIndex;
          const isActive = offset === 0;
          const isGone = offset < 0;

          // Cards deeper than MAX_VISIBLE stay hidden behind the stack.
          const hidden = offset > MAX_VISIBLE;

          const style: React.CSSProperties = {
            zIndex: total - Math.abs(offset),
            transform: isGone
              ? `translateY(-120%) rotate(-6deg)`
              : `translateY(${offset * 14}px) scale(${1 - offset * 0.04})`,
            opacity: isGone || hidden ? 0 : offset > MAX_VISIBLE - 1 ? 0 : 1,
            pointerEvents: isActive ? "auto" : "none",
          };

          return (
            <button
              key={card.id}
              type="button"
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={isActive ? onAdvance : undefined}
              style={style}
              className="absolute inset-0 block text-left transition-all duration-500 ease-out focus-visible:outline-none"
            >
              <IntroCardFace card={card} index={index} total={total} isLast={isLast && isActive} />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5" aria-label={`Card ${activeIndex + 1} of ${total}`}>
          {introCards.map((card, index) => (
            <span
              key={card.id}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-6 bg-primary"
                  : index < activeIndex
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

function IntroCardFace({
  card,
  index,
  total,
  isLast,
}: {
  card: IntroCard;
  index: number;
  total: number;
  isLast: boolean;
}) {
  return (
    <Card className="flex h-full w-full cursor-pointer flex-col justify-between p-6 shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-lg sm:p-8">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {card.eyebrow}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {index + 1}/{total}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {card.variant === "hero" && (
          <img
            src={profile.photoUrl}
            alt={profile.name}
            className="size-20 rounded-2xl object-cover"
          />
        )}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{card.title}</h2>
          {card.subtitle && <p className="text-sm font-medium text-primary">{card.subtitle}</p>}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{card.body}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {isLast ? "Tap to start chatting" : "Tap to continue"}
        <ArrowRight className="size-3.5" />
      </div>
    </Card>
  );
}
