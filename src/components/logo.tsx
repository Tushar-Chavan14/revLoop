import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/site";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export function Logo({ className, iconClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-semibold tracking-tight", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG mark, no benefit from next/image optimization */}
      <img
        src="/logo-orange.svg"
        alt=""
        aria-hidden="true"
        className={cn("h-9 w-9", iconClassName)}
      />
      {APP_NAME}
    </div>
  );
}
