import { cn } from "@/lib/utils";

interface RouteLoaderProps {
  message?: string;
  className?: string;
}

/** In-page navigation fallback (loading.tsx) — the riding bike, without the
 * blocking overlay FullscreenLoader uses, so the bottom nav stays usable. */
export function RouteLoader({ message = "Warming up the engine…", className }: RouteLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[70svh] flex-1 flex-col items-center justify-center gap-2",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- self-animating (SMIL) SVG, not a next/image candidate */}
      <img
        src="/Motorcycle_Loading.svg"
        alt=""
        width={320}
        height={180}
        fetchPriority="high"
        className="aspect-video w-80 max-w-full"
      />
      <p className="text-telemetry text-muted-foreground text-[11px]">{message}</p>
    </div>
  );
}
