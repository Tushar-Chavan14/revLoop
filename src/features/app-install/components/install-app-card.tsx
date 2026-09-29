"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { PlusSquare, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppInstall } from "@/features/app-install/components/app-install-provider";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "roadkin:install-card-dismissed-at";
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

// "Not now" is remembered per device for 30 days. Kept in memory too, so
// dismissing still works when the browser blocks storage (private mode).
const dismissListeners = new Set<() => void>();
let dismissedThisSession = false;

function isDismissed(): boolean {
  if (dismissedThisSession) {
    return true;
  }
  try {
    const at = Number(window.localStorage.getItem(DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

function dismissForNow() {
  dismissedThisSession = true;
  try {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Storage blocked — the in-memory flag still hides it for this visit.
  }
  dismissListeners.forEach((listener) => listener());
}

function subscribeDismissed(onChange: () => void) {
  dismissListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    dismissListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * "Put RoadKin on your Home Screen" — a one-tap install where the browser
 * supports it, step-by-step instructions on iPhone/iPad, and nothing at all
 * once it's installed, dismissed, or the browser can't install apps.
 */
export function InstallAppCard({ className }: { className?: string }) {
  const { mode, promptInstall } = useAppInstall();
  const dismissed = useSyncExternalStore(subscribeDismissed, isDismissed, () => true);
  const [busy, setBusy] = useState(false);

  if (dismissed || (mode !== "prompt" && mode !== "ios")) {
    return null;
  }

  async function handleInstall() {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "accepted") {
        toast.success({
          title: "RoadKin is on your Home Screen",
          description: "Open it from there any time — your crew is one tap away.",
        });
      } else if (outcome === "dismissed") {
        dismissForNow();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Install RoadKin"
      className={cn(
        "border-border bg-card relative flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center",
        className,
      )}
    >
      <button
        type="button"
        onClick={dismissForNow}
        aria-label="Not now"
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 flex size-8 items-center justify-center rounded-full transition-colors"
      >
        <X className="size-4" aria-hidden />
      </button>

      <div className="flex items-start gap-4 pr-8 sm:flex-1 sm:items-center">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={48}
          height={48}
          className="bg-secondary size-12 shrink-0 rounded-xl"
        />
        <div className="min-w-0">
          <p className="font-heading font-semibold">Put RoadKin on your Home Screen</p>
          {mode === "prompt" ? (
            <p className="text-muted-foreground mt-0.5 text-sm">
              Your rides and crew chats one tap away. Opens like an app, and ride alerts land like
              any other message.
            </p>
          ) : (
            <ol className="text-muted-foreground mt-1.5 flex flex-col gap-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Share className="size-4 shrink-0" aria-hidden />
                <span>
                  Tap the <span className="text-foreground font-medium">Share</span> button
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PlusSquare className="size-4 shrink-0" aria-hidden />
                <span>
                  Choose <span className="text-foreground font-medium">Add to Home Screen</span>
                </span>
              </li>
            </ol>
          )}
        </div>
      </div>

      <div className="flex gap-2 sm:shrink-0">
        {mode === "prompt" ? (
          <>
            <Button
              type="button"
              onClick={handleInstall}
              disabled={busy}
              className="flex-1 sm:flex-none"
            >
              Install RoadKin
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={dismissForNow}
              className="flex-1 sm:flex-none"
            >
              Not Now
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={dismissForNow}
            className="w-full sm:w-auto"
          >
            Got It
          </Button>
        )}
      </div>
    </section>
  );
}
