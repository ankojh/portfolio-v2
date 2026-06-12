import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";

export function ResumeButton({ className }: { className?: string }) {
  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <a href={profile.resumeUrl} download aria-label="Download resume">
        <Download className="size-4" />
        <span className="ml-2">Resume</span>
      </a>
    </Button>
  );
}
