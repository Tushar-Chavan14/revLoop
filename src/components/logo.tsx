import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

/**
 * The RoadKin lockup — the motorcycle-engine mark beside the wordmark set in
 * the poster face, so the smallest brand moment speaks the same Bebas as the
 * billboard. One colour: the wordmark is ink, the mark carries the orange.
 */
export function Logo({ className, iconClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG mark, no benefit from next/image optimization */}
      <img
        src="/roadkin-logo.svg"
        alt=""
        aria-hidden="true"
        className={cn("h-8 w-8", iconClassName)}
      />
      <span className="font-display pt-0.5 text-[28px] leading-none">RoadKin</span>
    </div>
  );
}
