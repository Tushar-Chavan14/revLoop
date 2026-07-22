"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DestinationSummary } from "@/services/rides";
import { searchPlaces, type LocationSuggestion } from "@/utils/geocode-search";
import { reverseGeocode } from "@/utils/reverse-geocode";

export interface CitySelection {
  lat: number;
  lng: number;
  label: string;
}

interface CityPickerProps {
  cityOptions: DestinationSummary[];
  value: CitySelection | null;
  onChange: (value: CitySelection | null) => void;
}

export function CityPicker({ cityOptions, value, onChange }: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  const matchedCities = useMemo(
    () =>
      cityOptions.filter((option) =>
        option.city.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [cityOptions, query],
  );

  // Cities with no rides yet aren't in `cityOptions` (it's built from
  // existing rides) — without this, someone browsing from a city that has no
  // rides yet couldn't select it at all. Global search fills that gap. The
  // timeout (rather than an early-return) keeps every setState call inside
  // an async callback instead of the effect body itself.
  useEffect(() => {
    const trimmed = query.trim();
    const timeout = setTimeout(async () => {
      if (trimmed.length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const results = await searchPlaces(trimmed, "place", { countryCode: "IN" });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const knownCityNames = useMemo(
    () => new Set(cityOptions.map((option) => option.city.toLowerCase())),
    [cityOptions],
  );
  const otherResults = searchResults.filter(
    (result) => !knownCityNames.has(result.name.toLowerCase()),
  );

  function selectCity(selection: CitySelection | null) {
    onChange(selection);
    setOpen(false);
  }

  function handleDetectLocation() {
    if (!("geolocation" in navigator)) {
      setLocateError("Location isn't available in this browser");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void reverseGeocode(latitude, longitude).then((result) => {
          selectCity({
            lat: latitude,
            lng: longitude,
            label: result?.city ?? result?.name ?? "Current location",
          });
          setLocating(false);
        });
      },
      () => {
        setLocateError("Couldn't get your location — check site permissions");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between sm:w-56")}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin className="text-primary size-4 shrink-0" />
          <span className="truncate">{value ? value.label : "All Cities"}</span>
        </span>
        <ChevronDown className="text-muted-foreground size-4 shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="flex flex-col gap-2 p-3">
          <Input
            autoFocus
            placeholder="Search any city"
            aria-label="Search any city"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className="text-primary hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium disabled:opacity-60"
          >
            <LocateFixed className="size-4" />
            {locating ? "Detecting..." : "Use My Location"}
          </button>
          {locateError && <p className="text-destructive text-xs">{locateError}</p>}
        </div>
        <div className="border-border max-h-72 overflow-y-auto border-t">
          <button
            type="button"
            onClick={() => selectCity(null)}
            className="hover:bg-muted flex w-full items-center px-3 py-2 text-left text-sm"
          >
            All Cities
          </button>

          {matchedCities.length > 0 && (
            <div className="flex flex-col">
              <p className="text-muted-foreground px-3 pt-2 text-xs font-medium tracking-wide uppercase">
                Cities With Rides
              </p>
              {matchedCities.map((option) => (
                <button
                  key={option.city}
                  type="button"
                  onClick={() =>
                    selectCity({ lat: option.lat, lng: option.lng, label: option.city })
                  }
                  className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                >
                  <span>{option.city}</span>
                  <span className="text-muted-foreground text-xs">
                    {option.rideCount} ride{option.rideCount === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (
            <div className="flex flex-col">
              <p className="text-muted-foreground px-3 pt-2 text-xs font-medium tracking-wide uppercase">
                Other Cities
              </p>
              {searching && <p className="text-muted-foreground px-3 py-2 text-sm">Searching...</p>}
              {!searching &&
                otherResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() =>
                      selectCity({
                        lat: result.lat,
                        lng: result.lng,
                        label: result.name,
                      })
                    }
                    className="hover:bg-muted flex w-full flex-col items-start px-3 py-2 text-left text-sm"
                  >
                    <span>{result.name}</span>
                    {result.displayName && (
                      <span className="text-muted-foreground text-xs">{result.displayName}</span>
                    )}
                  </button>
                ))}
              {!searching && otherResults.length === 0 && (
                <p className="text-muted-foreground px-3 py-2 text-sm">No Matches</p>
              )}
            </div>
          )}

          {matchedCities.length === 0 && query.trim().length < 2 && (
            <p className="text-muted-foreground px-3 py-4 text-center text-sm">
              Type to search any city
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
