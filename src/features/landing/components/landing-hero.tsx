"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WeekendCountdown } from "@/features/landing/components/weekend-countdown";

export interface HeroScene {
  /** 16:9 frame for wide screens. */
  src: string;
  /** 3:4 frame art-directed for phones. */
  mobileSrc: string;
  alt: string;
  /** Headline ink for this scene's sky: "ink" on a light sky, "white" on a dark one. */
  ink: "ink" | "white";
}

/** A scroll-scrubbed clip: dense-keyframe encodes plus each clip's own first frame. */
export interface HeroRide {
  mp4: string;
  mp4Mobile: string;
  poster: string;
  posterMobile: string;
}

interface LandingHeroProps {
  /**
   * "scrub": scroll is the playhead of the crew clip. "wipe": the lone rider
   * is swept into the crew behind a hi-vis edge.
   */
  mode?: "wipe" | "scrub";
  /** The clip for "scrub": scroll is the playhead. */
  ride?: HeroRide;
  /** "Still riding alone?": the rider alone. */
  alone: HeroScene;
  /** "Never ride alone again": the same road, the crew. */
  crew?: HeroScene;
  ctaHref: string;
  ctaLabel: string;
  weekendRideCount: number;
}

const INK = { ink: "text-[#111]", white: "text-white" } as const;

/**
 * The page's peak. The headline opens as a question over the road ("Still
 * riding alone?") and the scroll flips it into the answer ("Never ride alone
 * again"). "wipe": the crew sweeps across the lone rider behind a hi-vis edge
 * and the answer is revealed by the same sweep. "scrub": scroll is the clip's
 * playhead, the crew rides toward the visitor and the question gives way to
 * the answer. The first 10% of the scroll is held still so the opening reads.
 * Reduced motion: one still with the answer.
 */
export function LandingHero(props: LandingHeroProps) {
  return props.mode !== "wipe" && props.ride ? (
    <SplitScrubHero
      ride={props.ride}
      ctaHref={props.ctaHref}
      ctaLabel={props.ctaLabel}
      weekendRideCount={props.weekendRideCount}
    />
  ) : (
    <WipeHero {...props} />
  );
}

function WipeHero({
  mode = "scrub",
  ride,
  alone,
  crew,
  ctaHref,
  ctaLabel,
  weekendRideCount,
}: LandingHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const wipe = mode === "wipe" && !!crew && !reduceMotion;
  const scrub = mode === "scrub" && !!ride;
  const flip = wipe || (scrub && !reduceMotion);

  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Full 0–1 keyframes: framer runs clip-path/opacity on the native scroll
  // timeline, where progress past the last keyframe would fall back to the start.
  const edge = useTransform(p, [0, 0.1, 0.78, 1], [100, 100, 0, 0]);
  const crewClip = useMotionTemplate`inset(0 0 0 ${edge}%)`;
  const behindEdge = useTransform(edge, (value) => 100 - value);
  const questionClip = useMotionTemplate`inset(0 ${behindEdge}% 0 0)`;
  const edgeLeft = useMotionTemplate`${edge}%`;
  const edgeOpacity = useTransform(p, [0, 0.1, 0.12, 0.76, 0.78, 1], [0, 0, 1, 1, 0, 0]);
  const secondBeat = useTransform(p, [0, 0.7, 0.85, 1], [0, 0, 1, 1]);

  // Scrub: the question lifts away as the answer rises into its place.
  // The question has fully gone before the answer starts, so they never ghost.
  const questionOut = useTransform(p, [0, 0.24, 0.32, 1], [1, 1, 0, 0]);
  const questionY = useTransform(p, [0, 0.24, 0.32, 1], [0, 0, -28, -28]);
  const answerIn = useTransform(p, [0, 0.33, 0.43, 1], [0, 0, 1, 1]);
  const answerY = useTransform(p, [0, 0.33, 0.43, 1], [28, 28, 0, 0]);

  const finalScene = crew ?? alone;
  const firstScene = wipe ? alone : finalScene;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className={flip ? "relative h-[190svh] md:h-[220svh]" : "relative"}
    >
      <div className="bg-secondary sticky top-16 h-(--stage-h) overflow-hidden [--stage-h:max(calc(100svh-8rem),30rem)] sm:[--stage-h:max(calc(100svh-4rem),34rem)]">
        {scrub && ride ? (
          <ScrubbedRide ride={ride} section={sectionRef} still={!!reduceMotion} />
        ) : (
          <SceneImage scene={firstScene} eager />
        )}

        {/* Wipe: the same road, the crew, swept in from the right. */}
        {wipe && crew && (
          <motion.div className="absolute inset-0" style={{ clipPath: crewClip }}>
            <SceneImage scene={crew} />
          </motion.div>
        )}

        {/* The hi-vis edge of the sweep. */}
        {wipe && (
          <motion.span
            aria-hidden
            className="bg-primary absolute inset-y-0 z-10 w-2.5 -translate-x-1/2"
            style={{ left: edgeLeft, opacity: edgeOpacity }}
          />
        )}

        {/* The headline: the question and its answer share one place; the
            scroll flips one into the other. Assistive tech reads the answer. */}
        <h1
          id="hero-title"
          aria-label="Never ride alone again"
          className="font-display absolute inset-x-0 top-[3%] z-20 mx-auto grid max-w-[90rem] px-4 text-[19vw] leading-[0.86] sm:px-8 md:top-[5%] md:text-[min(10vw,17svh)]"
        >
          {flip && (
            <motion.span
              aria-hidden
              className={cn("col-start-1 row-start-1 block", INK[firstScene.ink])}
              style={
                wipe ? { clipPath: questionClip } : { opacity: questionOut, y: questionY }
              }
            >
              <span className="block">Still riding</span>
              <span className="block text-right">alone?</span>
            </motion.span>
          )}
          <motion.span
            aria-hidden
            className={cn("col-start-1 row-start-1 block", INK[finalScene.ink])}
            style={
              wipe
                ? { clipPath: crewClip }
                : flip
                  ? { opacity: answerIn, y: answerY }
                  : undefined
            }
          >
            <span className="block">Never ride</span>
            <span className="block text-right">alone again</span>
          </motion.span>
        </h1>

        {/* A scrim only where the copy sits. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-30 hidden h-[46%] bg-[linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.45)_50%,rgba(0,0,0,0))] md:block"
        />

        {/* Phones: the intro sits in the open sky under the headline, in ink,
            so the riders coming up the road stay clear. Wider: bottom corners. */}
        <div className="absolute inset-x-0 top-[calc(3%+33vw+1.25rem)] z-40 mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-4 sm:px-8 md:top-auto md:bottom-0 md:flex-row md:items-end md:justify-between md:pb-10">
          <div className="flex max-w-[30rem] flex-col gap-4 text-[#111] md:text-white">
            <p className="text-[17px] leading-snug font-medium text-pretty sm:text-lg">
              RoadKin is where India&apos;s weekend motorcycle crews plan their rides: route,
              meeting pin, pace and seats on one page.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button
                nativeButton={false}
                size="lg"
                render={<Link href={ctaHref}>{ctaLabel}</Link>}
              />
              <Link
                href="/rides"
                className="text-[15px] font-bold underline decoration-2 underline-offset-4 hover:decoration-[3px]"
              >
                See every ride
              </Link>
            </div>
          </div>
          {/* The second beat: once the crew is on the road, the weekend. */}
          <motion.div
            style={flip ? { opacity: secondBeat } : undefined}
            className="hidden text-white md:block"
          >
            <WeekendCountdown rideCount={weekendRideCount} tone="light" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** One scene, art-directed: phones get the 3:4 frame, wider screens the 16:9. */
function SceneImage({ scene, eager = false }: { scene: HeroScene; eager?: boolean }) {
  const common = { alt: scene.alt, fill: true, sizes: "100vw", quality: 75 } as const;
  const wide = getImageProps({ ...common, src: scene.src }).props;
  const { srcSet: phoneSrcSet, ...img } = getImageProps({ ...common, src: scene.mobileSrc }).props;
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide.srcSet} />
      <source media="(max-width: 767px)" srcSet={phoneSrcSet} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img
        {...img}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="object-cover"
      />
    </picture>
  );
}

const PHONE = "(max-width: 767px)";
const isPhone = () => window.matchMedia(PHONE).matches;
const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * The scroll-scrubbed ride. Scroll never writes currentTime directly: it sets
 * a target, and a rAF loop walks the playhead 18% of the way there each frame
 * (with a small deadband and no new seek while one is still decoding), so the
 * clip glides under the wheel instead of stuttering. The clip is mapped across
 * the hero's whole visible life, so it never freezes while the section slides
 * away. The clip's own first frame stays up as a poster until a real video
 * frame has painted.
 */
function ScrubbedRide({
  ride,
  section,
  still,
  position = "object-[55%_50%]",
}: {
  ride: HeroRide;
  section: React.RefObject<HTMLElement | null>;
  still: boolean;
  /** object-position utility for the poster and the clip. */
  position?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => null);
  const src = still || phone === null ? null : phone ? ride.mp4Mobile : ride.mp4;
  const [painted, setPainted] = useState(false);
  const { scrollYProgress: life } = useScroll({ target: section, offset: ["start start", "end start"] });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    let frame = 0;
    let current = 0;
    const deadband = window.matchMedia("(max-width: 767px)").matches ? 0.02 : 0.008;

    const onReady = () => {
      // iOS keeps a muted video that was only ever seeked blank: play a beat once.
      video.play().then(() => video.pause()).catch(() => {});
    };
    const onPainted = () => setPainted(true);
    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("seeked", onPainted, { once: true });

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!video.duration || video.seeking) return;
      const target = Math.min(1, Math.max(0, life.get())) * (video.duration - 0.05);
      current += (target - current) * 0.18;
      if (Math.abs(video.currentTime - current) > deadband) video.currentTime = current;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("seeked", onPainted);
    };
  }, [src, life]);

  return (
    <>
      <picture>
        <source media="(min-width: 768px)" srcSet={ride.poster} />
        <img
          src={ride.posterMobile}
          alt="A crew of motorcyclists riding together up a mountain highway in morning light"
          fetchPriority="high"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            position,
            painted && "opacity-0",
          )}
        />
      </picture>
      {src && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          className={cn("absolute inset-0 h-full w-full object-cover", position)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The split hero: the scrubbed ride runs in the band between the two */
/* headline lines, and the lines flip like a departures board.        */
/* ------------------------------------------------------------------ */

// Each headline line is sized to the screen's height as well as its width,
// so the two lines plus the road between them always fill one screen.
const LINE_SIZE = "text-[min(15vw,6rem)] lg:text-[min(11vw,17svh)]";

/** Pads two phrases to one length so every letter slot has a partner. */
function pairUp(from: string, to: string, align: "start" | "end") {
  const length = Math.max(from.length, to.length);
  const pad = (text: string) => (align === "start" ? text.padEnd(length) : text.padStart(length));
  return { from: pad(from), to: pad(to) };
}

function SplitScrubHero({
  ride,
  ctaHref,
  ctaLabel,
  weekendRideCount,
}: {
  ride: HeroRide;
  ctaHref: string;
  ctaLabel: string;
  weekendRideCount: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const intro = (
    <div className="flex max-w-[30rem] flex-col gap-4">
      <p className="text-lg leading-snug font-medium text-pretty">
        RoadKin is where India&apos;s weekend motorcycle crews plan their rides: route, meeting
        pin, pace and seats on one page.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button nativeButton={false} size="lg" render={<Link href={ctaHref}>{ctaLabel}</Link>} />
        <Link
          href="/rides"
          className="text-[15px] font-bold underline decoration-2 underline-offset-4 hover:decoration-[3px]"
        >
          See every ride
        </Link>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className={still ? "relative" : "relative h-[200svh] md:h-[220svh]"}
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden",
          still
            ? "lg:h-[calc(100svh-4rem)]"
            : "sticky top-16 h-[max(calc(100svh-8rem),34rem)] sm:h-[max(calc(100svh-4rem),36rem)]",
        )}
      >
        <div className="relative mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col px-4 pt-4 pb-4 sm:px-8 sm:pb-6">
          {/* The road runs inside the h1; assistive tech reads the answer. */}
          <h1
            id="hero-title"
            aria-label="Never ride alone again"
            className={cn(
              "font-display flex min-h-0 flex-1 flex-col gap-3 leading-[0.86] lg:gap-5",
              LINE_SIZE,
            )}
          >
            <FlipLine from="Still riding" to="Never ride" align="start" span={[0.18, 0.42]} progress={p} still={still} />
            <span
              aria-hidden
              className="bg-secondary relative -mx-4 block min-h-0 flex-1 overflow-hidden sm:-mx-8 lg:mx-[calc(50%-50vw)]"
            >
              <ScrubbedRide
                ride={ride}
                section={sectionRef}
                still={still}
                position="object-[55%_62%]"
              />
            </span>
            <FlipLine
              from="alone?"
              to="alone again"
              align="end"
              span={[0.4, 0.62]}
              progress={p}
              still={still}
              // From 1024 the intro sits beside this line: the line is at
              // least as tall as the intro so the band always ends above it.
              className="lg:min-h-[9.5rem] lg:items-end"
            />
          </h1>

          {/* From tablet width the countdown answers line one from the
              top-right (line one never reaches past the middle), and from
              1024 the intro shares line two's baseline on the left, capped so
              it never meets "alone again". Each block is aligned to its line
              by the same size formula the headline uses. */}
          <div className="absolute top-4 right-4 hidden items-end sm:right-8 md:flex md:h-[calc(min(15vw,6rem)*0.86)] lg:h-[calc(min(11vw,17svh)*0.86)]">
            <WeekendCountdown rideCount={weekendRideCount} />
          </div>
          <div className="absolute bottom-6 left-8 hidden max-w-[min(30rem,40vw)] lg:block">
            {intro}
          </div>

          {/* Phones and tablets: the intro follows the sentence. */}
          <div className="mt-5 lg:hidden">{intro}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * One headline line that flips letter by letter, like a split-flap board:
 * every slot holds the old and the new character, the old one folds away and
 * the new one folds in, staggered across the line by scroll progress.
 */
function FlipLine({
  from,
  to,
  align,
  span,
  progress,
  still,
  className,
}: {
  from: string;
  to: string;
  align: "start" | "end";
  span: [number, number];
  className?: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  still: boolean;
}) {
  if (still) {
    return (
      <span
        aria-hidden
        className={cn("flex", align === "end" && "self-end", className)}
      >
        {to}
      </span>
    );
  }
  const pair = pairUp(from, to, align);
  const slots = pair.from.length;
  const step = (span[1] - span[0]) / slots;
  // Right-aligned lines flip from their end, so the motion reads outward.
  return (
    <span
      aria-hidden
      className={cn("flex whitespace-pre", align === "end" && "self-end", className)}
    >
      {[...pair.from].map((char, index) => (
        <FlipChar
          key={index}
          from={char}
          to={pair.to[index]}
          at={span[0] + (align === "end" ? slots - 1 - index : index) * step}
          progress={progress}
        />
      ))}
    </span>
  );
}

const FLIP = 0.045;

function FlipChar({
  from,
  to,
  at,
  progress,
}: {
  from: string;
  to: string;
  at: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const half = FLIP / 2;
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<[number, number] | null>(null);

  // Each slot is exactly as wide as the letter it shows: the old letter's
  // width until the flip is edge-on, the new letter's after, so both phrases
  // keep their natural spacing and the switch is never visible.
  useEffect(() => {
    let alive = true;
    const measure = () => {
      if (alive && fromRef.current && toRef.current) {
        setWidths([fromRef.current.offsetWidth, toRef.current.offsetWidth]);
      }
    };
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      window.removeEventListener("resize", measure);
    };
  }, []);

  const outRotate = useTransform(progress, [0, at, at + half, 1], [0, 0, -90, -90]);
  const outOpacity = useTransform(progress, [0, at + half * 0.9, at + half, 1], [1, 1, 0, 0]);
  const inRotate = useTransform(progress, [0, at + half, at + FLIP, 1], [90, 90, 0, 0]);
  const inOpacity = useTransform(progress, [0, at + half, at + half * 1.1, 1], [0, 0, 1, 1]);
  const width = useTransform(
    progress,
    [0, at + half, at + half + 0.0001, 1],
    widths ? [widths[0], widths[0], widths[1], widths[1]] : [0, 0, 0, 0],
  );

  if (from === to) {
    return <span className="inline-block">{to}</span>;
  }
  return (
    <motion.span
      className="relative inline-block [perspective:800px]"
      style={widths ? { width } : undefined}
    >
      {/* Holds the line's height once both letters are positioned absolutely. */}
      <span aria-hidden className="invisible inline-block w-0">
        X
      </span>
      <motion.span
        ref={fromRef}
        className={cn(
          "inline-block origin-center [backface-visibility:hidden]",
          widths && "absolute top-0 left-0",
        )}
        style={{ rotateX: outRotate, opacity: outOpacity }}
      >
        {from}
      </motion.span>
      <motion.span
        ref={toRef}
        className="absolute top-0 left-0 inline-block origin-center [backface-visibility:hidden]"
        style={{ rotateX: inRotate, opacity: inOpacity }}
      >
        {to}
      </motion.span>
    </motion.span>
  );
}
