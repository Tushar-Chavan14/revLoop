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
        className="ring-foreground/10 focus-visible:ring-primary relative block aspect-3/4 w-full overflow-hidden rounded-2xl ring-1 outline-none focus-visible:ring-2"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="from-secondary via-secondary/70 to-primary/30 absolute inset-0 bg-linear-to-br" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1">
          <p className="font-heading text-lg font-semibold text-white">{city}</p>
          <p className="flex items-center gap-1 text-xs text-white/70">
            <MapPin className="size-3" aria-hidden />
            {rideCount} ride{rideCount === 1 ? "" : "s"} planned
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
