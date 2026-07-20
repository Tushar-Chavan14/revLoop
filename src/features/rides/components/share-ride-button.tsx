"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareRideButtonProps {
  title: string;
  text?: string;
  className?: string;
}

export function ShareRideButton({ title, text, className }: ShareRideButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    // Web Share API opens the native share sheet on mobile — the best
    // experience where it's available. Desktop browsers mostly don't
    // support it, so fall back to copying the link instead.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User dismissed the share sheet — not an error worth surfacing.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing more we can do here.
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleShare} className={className}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
