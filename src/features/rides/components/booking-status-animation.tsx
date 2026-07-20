"use client";

import { motion } from "framer-motion";
import { Bike } from "lucide-react";
import { EASE_BRAND } from "@/lib/motion";

// Zigzag "road" in a 0–100 percentage coordinate space, shared by both the
// drawn road (SVG polyline, viewBox 0 0 100 100, preserveAspectRatio="none")
// and the bike's motion keyframes, so the two always line up regardless of
// container size.
const ROAD_POINTS = [
  { x: 2, y: 78 },
  { x: 22, y: 22 },
  { x: 42, y: 78 },
  { x: 62, y: 22 },
  { x: 82, y: 78 },
  { x: 96, y: 30 },
];
const ROAD_POLYLINE = ROAD_POINTS.map((p) => `${p.x},${p.y}`).join(" ");
const BIKE_LEAN = [0, -22, 22, -22, 22, -12, 0];

export function BookingSuccessAnimation() {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative h-28 w-full max-w-sm">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <motion.polyline
            points={ROAD_POLYLINE}
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 3"
            className="stroke-muted-foreground/30"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: EASE_BRAND }}
          />
        </svg>
        <motion.div
          className="text-primary absolute"
          style={{ marginLeft: -14, marginTop: -14 }}
          initial={{ left: `${ROAD_POINTS[0].x}%`, top: `${ROAD_POINTS[0].y}%`, rotate: 0 }}
          animate={{
            left: ROAD_POINTS.map((p) => `${p.x}%`),
            top: ROAD_POINTS.map((p) => `${p.y}%`),
            rotate: BIKE_LEAN,
          }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          <Bike className="size-7" />
        </motion.div>
      </div>
      <motion.div
        className="flex flex-col items-center gap-1 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4, ease: EASE_BRAND }}
      >
        <p className="text-base font-semibold">Thank you for booking! 🏍️</p>
        <p className="text-muted-foreground text-sm">You&apos;re all set — see you on the ride.</p>
      </motion.div>
    </div>
  );
}

export function BookingFailureAnimation() {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <motion.div
        className="text-destructive"
        animate={{
          x: [0, -6, 6, -6, 6, -3, 3, 0],
          rotate: [0, -8, 8, -8, 8, -4, 4, 0],
        }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <Bike className="size-10" />
      </motion.div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Uh-oh, hit a pothole 🕳️</p>
        <p className="text-muted-foreground text-sm">
          Your payment didn&apos;t go through — no charge was made. Give it another go to get back
          on the road.
        </p>
      </div>
    </div>
  );
}
