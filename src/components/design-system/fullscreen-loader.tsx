interface FullscreenLoaderProps {
  message: string;
}

/** Blocks interaction with the rest of the page while an async flow (like
 * confirming a booking payment) is in progress, so a stray click elsewhere
 * can't navigate away and orphan it. */
export function FullscreenLoader({ message }: FullscreenLoaderProps) {
  return (
    <div className="bg-background/90 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
      {/* eslint-disable-next-line @next/next/no-img-element -- self-animating (SMIL) SVG, not a next/image candidate */}
      <img src="/Motorcycle_Loading.svg" alt="" className="h-48 w-48" />
      <p className="text-foreground text-sm font-medium">{message}</p>
    </div>
  );
}
