import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { recordResumeDownload } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ResumeButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={cn(
        "h-9 rounded-lg border-border bg-card px-3 text-card-foreground shadow-sm ring-1 ring-black/5 transition-all hover:bg-card hover:text-card-foreground hover:shadow-md",
        className,
      )}
    >
      <a
        href={profile.resumeUrl}
        download
        aria-label="Download resume"
        onClick={() => recordResumeDownload(profile.resumeUrl)}
      >
        <Download className="size-4" />
        <span className="ml-2">Resume</span>
      </a>
    </Button>
  );
}
