// Browser-only helpers — call from effects/event handlers or
// useSyncExternalStore snapshots, never during server render.

export function isIOSDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Running as the installed Home Screen / desktop app rather than a browser tab. */
export function isInstalledApp(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's non-standard flag for Home Screen web apps.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
