"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Milestone } from "@/components/design-system/milestone";
import { cn } from "@/lib/utils";

// Scroll mappings always span the full 0–1 range: framer runs opacity, filter
// and clip-path on the native scroll timeline, where progress past the last
// keyframe falls back to the base value instead of holding the end state.

/* ------------------------------------------------------------------ */
/* How a ride comes together: the frame holds, the lines step in.     */
/* ------------------------------------------------------------------ */

export interface Stage {
  line: string;
  detail: string;
}

const STAGE_INDENT = ["", "lg:pl-[12%]", "lg:pl-[24%]", "lg:pl-[36%]"];
const STAGE_INDENT_PHONE = ["pl-0", "pl-[6vw]", "pl-[12vw]", "pl-[18vw]"];

export function PinnedStages({ stages }: { stages: readonly Stage[] }) {
  const ref = useRef<HTMLElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section
      ref={ref}
      aria-labelledby="stage-0"
      className={cn("relative mt-36 lg:mt-52", still ? "" : "h-[200svh] md:h-[240svh]")}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[90rem] items-center px-4 sm:px-8",
          still ? "" : "sticky top-16 h-[calc(100svh-8rem)] sm:h-[calc(100svh-4rem)]",
        )}
      >
        <ol className="flex w-full flex-col gap-8 lg:gap-12">
          {stages.map((stage, index) => (
            <StageLine
              key={stage.line}
              stage={stage}
              index={index}
              last={index === stages.length - 1}
              progress={p}
              still={still}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StageLine({
  stage,
  index,
  last,
  progress,
  still,
}: {
  stage: Stage;
  index: number;
  last: boolean;
  progress: MotionValue<number>;
  still: boolean;
}) {
  // The first line is already there (it is the section's heading); the rest
  // arrive one per fifth of the hold and stay, so the staircase builds.
  const from = index === 0 ? 0 : 0.06 + index * 0.18;
  const to = index === 0 ? 0.001 : from + 0.12;
  const opacity = useTransform(progress, [0, from, to, 1], [index === 0 ? 1 : 0, index === 0 ? 1 : 0, 1, 1]);
  const y = useTransform(progress, [0, from, to, 1], [index === 0 ? 0 : 28, index === 0 ? 0 : 28, 0, 0]);
  const Title = index === 0 ? "h2" : "p";

  return (
    <motion.li
      style={still ? undefined : { opacity, y }}
      className={cn(STAGE_INDENT_PHONE[index], STAGE_INDENT[index])}
    >
      <Title
        id={index === 0 ? "stage-0" : undefined}
        className={cn(
          "font-display text-[8.4vw] leading-none sm:text-[clamp(36px,4.6vw,76px)]",
          last && "text-primary-ink",
        )}
      >
        {stage.line}
      </Title>
      <p className="mt-3 max-w-[34ch] text-[17px] leading-snug">{stage.detail}</p>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Roads we keep riding: the field opens, the prints are dealt.       */
/* ------------------------------------------------------------------ */

export interface Print {
  destination: string;
  rideCount: number;
  photo: string;
}

const PRINT_REST = [
  { rotate: -6, y: 24 },
  { rotate: 5, y: 0 },
  { rotate: -2, y: 40 },
];

export function DealtPrints({ prints }: { prints: Print[] }) {
  const ref = useRef<HTMLElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const inset = useTransform(p, [0, 0.45, 1], [7, 0, 0]);
  const clip = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
  const shown = prints.slice(0, 3);

  return (
    <motion.section
      ref={ref}
      aria-labelledby="roads-title"
      style={still ? undefined : { clipPath: clip }}
      className="bg-secondary text-secondary-foreground mt-36 overflow-hidden px-4 pt-20 pb-16 sm:px-8 lg:mt-52 lg:pt-28 lg:pb-20"
    >
      <div className="mx-auto w-full max-w-[90rem]">
        <h2
          id="roads-title"
          className="font-display text-center text-[19vw] leading-[0.85] sm:text-[clamp(120px,13vw,200px)]"
        >
          Roads we
          <br />
          keep riding
        </h2>
        <ul className="mt-12 flex items-start justify-center sm:mt-16">
          {shown.map((destination, index) => (
            <DealtPrint
              key={destination.destination}
              print={destination}
              index={index}
              count={shown.length}
              progress={p}
              still={still}
            />
          ))}
        </ul>
        <p className="mt-12 max-w-md text-[17px] text-white/80">
          {prints.map((print) => print.destination).join(", ")}: the places our crews keep
          riding back to. Tap one for its rides.
        </p>
      </div>
    </motion.section>
  );
}

function DealtPrint({
  print,
  index,
  count,
  progress,
  still,
}: {
  print: Print;
  index: number;
  count: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const rest = PRINT_REST[index];
  // Each print starts squared up on the middle of the stack and is dealt
  // outward to its own angle, one after another.
  const toCentre = (count - 1) / 2 - index;
  const from = 0.35 + index * 0.12;
  const to = from + 0.3;
  const x = useTransform(progress, [0, from, to, 1], [`${toCentre * 70}%`, `${toCentre * 70}%`, "0%", "0%"]);
  const rotate = useTransform(progress, [0, from, to, 1], [0, 0, rest.rotate, rest.rotate]);
  const y = useTransform(progress, [0, from, to, 1], [0, 0, rest.y, rest.y]);

  return (
    <motion.li
      style={still ? { rotate: rest.rotate, y: rest.y } : { x, rotate, y }}
      className={cn(
        "relative w-[46vw] sm:w-[24vw] sm:max-w-[22rem]",
        index > 0 && "-ml-[8vw] sm:-ml-[3vw]",
        index === 1 && "z-[1]",
        index === 2 && "hidden sm:block",
      )}
    >
      <Link
        href={`/rides?q=${encodeURIComponent(print.destination)}`}
        className="relative block bg-white p-2 pb-3 transition-[scale] duration-200 ease-out hover:z-10 hover:scale-[1.03]"
      >
        <span className="relative block aspect-3/4 w-full overflow-hidden">
          <Image
            src={print.photo}
            alt={`${print.destination}, where RoadKin rides are headed`}
            fill
            unoptimized
            className="object-cover"
          />
        </span>
        <span className="flex flex-col gap-1 pt-2 text-[#111]">
          <span className="font-display text-2xl leading-none sm:text-3xl">{print.destination}</span>
          <span className="text-[13px] font-semibold tabular-nums">
            {print.rideCount} ride{print.rideCount === 1 ? "" : "s"} planned
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* The close: the field wipes up from below and holds.                */
/* ------------------------------------------------------------------ */

export function WipeUp({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "start 20%"] });
  const top = useTransform(p, [0, 0.15, 1], [100, 100, 0]);
  const clip = useMotionTemplate`inset(${top}% 0% 0% 0%)`;

  return (
    <motion.section
      ref={ref}
      aria-labelledby="close-title"
      style={still ? undefined : { clipPath: clip }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* The signature: a roadside stone that counts the ride down.         */
/* ------------------------------------------------------------------ */

/**
 * A kilometre stone at the bottom-left roadside corner once the hero has
 * passed (wider screens only: on a phone it would sit over the headings).
 * Its cap counts the featured ride's real distance down to zero as the page
 * scrolls from the end of the hero to the close; at the close it reads 0 km.
 * It steps aside for the footer.
 */
export function JourneyStone({ place, km }: { place: string; km: number }) {
  const [left, setLeft] = useState(km);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>('section[aria-labelledby="hero-title"]');
      const close = document.querySelector<HTMLElement>('section[aria-labelledby="close-title"]');
      const footer = document.querySelector<HTMLElement>("footer");
      if (!hero || !close) return;
      const vh = window.innerHeight;
      const start = hero.offsetTop + hero.offsetHeight - vh;
      const end = close.offsetTop - vh * 0.1;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      setLeft(Math.round(km * (1 - progress)));
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      setVisible(window.scrollY > start + vh * 0.3 && footerTop > vh * 0.5);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [km]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed bottom-6 left-8 z-30 hidden transition-[opacity,translate] duration-300 md:block",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <Milestone place={place} km={left} cap={left === 0 ? "Arrived" : undefined} />
    </div>
  );
}
