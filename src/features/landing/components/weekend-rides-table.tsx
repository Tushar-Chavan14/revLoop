"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RideCardData } from "@/services/rides";

const ALL = "All cities";

/**
 * The weekend's departures as a timetable: day, the ride and its road, the
 * distance and the seats left. The city row filters it — where the visitor
 * rides out from — and each row is a link to the ride's own page.
 */
export function WeekendRidesTable({ rides }: { rides: RideCardData[] }) {
  const cities = [ALL, ...new Set(rides.map((ride) => ride.city).filter((c): c is string => !!c))];
  const [city, setCity] = useState(ALL);
  const still = useReducedMotion();
  const shown = city === ALL ? rides : rides.filter((ride) => ride.city === city);

  return (
    <div className="flex flex-col gap-6">
      {cities.length > 2 && (
        <div role="group" aria-label="Leaving from" className="flex flex-wrap gap-2">
          {cities.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={city === option}
              onClick={() => setCity(option)}
              className={cn(
                "h-10 rounded-md px-4 text-[15px] font-semibold transition-colors active:translate-y-px",
                city === option
                  ? "bg-foreground text-background"
                  : "bg-card hover:bg-surface text-foreground",
              )}
            >
              {option === ALL ? option : `From ${option}`}
            </button>
          ))}
        </div>
      )}

      <ul className="flex flex-col">
        {shown.map((ride, index) => {
          const isFull = ride.seats_available !== null && ride.seats_available <= 0;
          return (
            // Rows roll in one after another, like a departures board.
            <motion.li
              key={ride.id}
              initial={still ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/rides/${ride.id}`}
                className="group hover:bg-card -mx-3 grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-x-4 rounded-md px-3 py-4 transition-colors sm:grid-cols-[7rem_1fr_auto]"
              >
                <span className="text-muted-foreground text-[15px] font-semibold tabular-nums">
                  {ride.ride_date ? format(new Date(ride.ride_date), "EEE d MMM") : "Soon"}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[17px] font-bold">{ride.title}</span>
                  <span className="text-muted-foreground truncate text-[15px]">
                    {[ride.city, ride.destination].filter(Boolean).join(" → ")}
                    {ride.pricing_model === "organized" && " · organized tour"}
                  </span>
                </span>
                <span className="flex items-baseline gap-3 text-right">
                  <span className="flex flex-col items-end gap-0.5 tabular-nums">
                    {ride.estimated_distance_km ? (
                      <span className="text-[17px] font-bold">{ride.estimated_distance_km} km</span>
                    ) : (
                      <span className="text-muted-foreground text-[17px]">—</span>
                    )}
                    <span
                      className={cn(
                        "text-[15px]",
                        isFull ? "text-muted-foreground" : "text-primary-ink font-semibold",
                      )}
                    >
                      {ride.seats_available === null
                        ? "Open"
                        : isFull
                          ? "Full"
                          : `${ride.seats_available} seat${ride.seats_available === 1 ? "" : "s"} left`}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 self-center transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
