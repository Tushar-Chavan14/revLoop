import { cn } from "@/lib/utils";

const SIZES = {
  sm: { cap: "px-3 pt-2 pb-0.5 text-[15px]", body: "px-3 pt-1 pb-1.5 text-xl", min: "min-w-[5.5rem]" },
  md: { cap: "px-4 pt-3 pb-0.5 text-lg", body: "px-4 pt-1 pb-2 text-3xl", min: "min-w-[7rem]" },
  lg: { cap: "px-5 pt-4 pb-1 text-2xl", body: "px-5 pt-1.5 pb-3 text-5xl", min: "min-w-[9rem]" },
} as const;

interface MilestoneProps {
  /** The place the stone points to — the ride's destination. */
  place: string;
  /** Distance in km, set in the cap. Omitted when the ride has none. */
  km?: number | null;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * The Indian highway kilometre stone — a white stone with a coloured dome cap,
 * the place name and the distance to it. Every crew stops beside one for the
 * photo, so it is RoadKin's signature object: each ride's destination and
 * distance is set on one. It stays white in dark mode because it is a physical
 * thing on the roadside, not a themed surface.
 */
export function Milestone({ place, km, size = "sm", className }: MilestoneProps) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "font-display inline-flex w-fit max-w-full flex-col text-center leading-none",
        s.min,
        className,
      )}
    >
      <span
        className={cn("bg-primary block text-[#111] tabular-nums", s.cap)}
        style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
      >
        {km ? `${Math.round(km).toLocaleString("en-IN")} km` : " "}
      </span>
      <span className={cn("block truncate bg-white text-[#111]", s.body)}>{place}</span>
    </span>
  );
}
