"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { isInstalledApp, isIOSDevice } from "@/utils/device";
import { registerServiceWorker } from "@/utils/service-worker";

// Chromium-only event (Chrome, Edge, Samsung Internet, Opera) — not in the DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * - `prompt`: the browser offers a one-tap install (Android, desktop Chrome/Edge)
 * - `ios`: iPhone/iPad — installing is manual, via Share → Add to Home Screen
 * - `installed`: already running as the installed app
 * - `unavailable`: this browser can't install (e.g. desktop Firefox), or hasn't offered yet
 * - `unknown`: before hydration
 */
export type InstallMode = "unknown" | "installed" | "ios" | "prompt" | "unavailable";

interface AppInstallValue {
  mode: InstallMode;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

const AppInstallContext = createContext<AppInstallValue | null>(null);

function noopSubscribe() {
  return () => {};
}

function subscribeDisplayMode(onChange: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Mounted in the root layout so the browser's install offer is caught no
 * matter which page the rider lands on — it fires once per page load, often
 * before the page that shows the install card has even rendered.
 */
export function AppInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const installed = useSyncExternalStore(subscribeDisplayMode, isInstalledApp, () => false);
  const ios = useSyncExternalStore(noopSubscribe, isIOSDevice, () => false);

  // Register the service worker for every visitor (not just riders with ride
  // alerts on) — installable-app support and the "no signal" page need it.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      registerServiceWorker().catch(() => {});
    }
  }, []);

  useEffect(() => {
    function handleInstallOffer(event: Event) {
      // Skip the browser's own mini-infobar — RoadKin shows its own card instead.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setDeferredPrompt(null);
      setJustInstalled(true);
    }
    window.addEventListener("beforeinstallprompt", handleInstallOffer);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallOffer);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return "unavailable" as const;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // An install offer can only be used once.
    setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt]);

  const mode: InstallMode = !hydrated
    ? "unknown"
    : installed || justInstalled
      ? "installed"
      : ios
        ? "ios"
        : deferredPrompt
          ? "prompt"
          : "unavailable";

  return <AppInstallContext value={{ mode, promptInstall }}>{children}</AppInstallContext>;
}

export function useAppInstall(): AppInstallValue {
  const value = useContext(AppInstallContext);
  if (!value) {
    throw new Error("useAppInstall must be used inside <AppInstallProvider>");
  }
  return value;
}
