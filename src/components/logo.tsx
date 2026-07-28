import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

/**
 * The RoadKin lockup — the motorcycle-engine mark beside a tracked, uppercase
 * wordmark. The wide letter-spacing gives it the premium, technical register of
 * Peak Design / Garmin gear rather than a soft app logotype.
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
      <span className="font-heading text-[15px] font-extrabold tracking-[0.2em] uppercase">
        Road<span className="text-primary">Kin</span>
      </span>
    </div>
  );
}
