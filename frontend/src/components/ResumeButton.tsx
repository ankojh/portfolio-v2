import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

export function ResumeButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={cn(
        "border-border/80 bg-card shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.035] transition-shadow hover:bg-card hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      <a href={profile.resumeUrl} download aria-label="Download resume">
        <Download className="size-4" />
        <span className="ml-2">Resume</span>
      </a>
    </Button>
  );
}
