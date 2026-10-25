"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { hoverLift } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  href: string;
  city: string;
  rideCount: number;
  imageUrl?: string;
  className?: string;
}

/** A place riders are heading — used in "Popular destinations" style rails. */
export function DestinationCard({
  href,
  city,
  rideCount,
  imageUrl,
  className,
}: DestinationCardProps) {
  return (
    <motion.div {...hoverLift} className={cn("group relative shrink-0", className)}>
      <Link
        href={href}
        className="bg-secondary focus-visible:ring-ring relative block aspect-3/4 w-full overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {imageUrl && (
          <>
            <Image
              src={imageUrl}
              alt=""
              fill
              unoptimized
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            {/* Neutral scrim so the white type reads on any photograph. */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
          </>
        )}
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1">
          <p className="text-lg font-bold text-white">{city}</p>
          <p className="flex items-center gap-1 text-sm text-white/75 tabular-nums">
            <MapPin className="size-3.5" aria-hidden />
            {rideCount} ride{rideCount === 1 ? "" : "s"} planned
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
