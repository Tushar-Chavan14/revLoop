"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { CityPicker, type CitySelection } from "@/features/rides/components/city-picker";
import type { DestinationSummary } from "@/services/rides";

const SORT_OPTIONS = [
  { value: "soonest", label: "Soonest" },
  { value: "newest", label: "Newest" },
  { value: "seats", label: "Most seats" },
] as const;

// Buckets for the ride's own trip length (estimated_distance_km) — distinct
// from the fixed 50km "how far from the selected city" radius used for
// nearby-city search, which isn't user-configurable.
const DISTANCE_OPTIONS = [
  { value: "any", label: "Any distance", min: undefined, max: undefined },
  { value: "0-50", label: "Up to 50 km", min: undefined, max: 50 },
  { value: "50-150", label: "50–150 km", min: 50, max: 150 },
  { value: "150-300", label: "150–300 km", min: 150, max: 300 },
  { value: "300+", label: "300+ km", min: 300, max: undefined },
] as const;

// Community = free rides, Organized = paid rides (rides.pricing_model).
const PRICING_OPTIONS = [
  { value: "community", label: "Community (free)" },
  { value: "organized", label: "Organized (paid)" },
] as const;

export function RidesFilters({ cityOptions }: { cityOptions: DestinationSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The advanced filters expand as a full-width panel below the toolbar row
  // instead of a small anchored dropdown — floating over the results below
  // reads worse than pushing them down.
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rideTypes = searchParams.get("types")?.split(",").filter(Boolean) ?? [];
  const speed = searchParams.get("speed") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";
  const openSeatsOnly = searchParams.get("seats") === "1";
  const sort = searchParams.get("sort") ?? "soonest";
  const pricing = searchParams.get("pricing") ?? "";

  const cityLatParam = searchParams.get("cityLat");
  const cityLngParam = searchParams.get("cityLng");
  const cityLabelParam = searchParams.get("cityLabel");
  const citySelection: CitySelection | null =
    cityLatParam && cityLngParam && cityLabelParam
      ? { lat: Number(cityLatParam), lng: Number(cityLngParam), label: cityLabelParam }
      : null;
  const distance = searchParams.get("distance") ?? "any";

  const hasActiveFilters =
    rideTypes.length > 0 ||
    speed ||
    difficulty ||
    pricing ||
    dateFrom ||
    dateTo ||
    openSeatsOnly ||
    search ||
    citySelection ||
    distance !== "any";

  const advancedFilterCount =
    rideTypes.length +
    [speed, difficulty, pricing, dateFrom, dateTo].filter(Boolean).length +
    (openSeatsOnly ? 1 : 0) +
    (distance !== "any" ? 1 : 0);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (search !== (searchParams.get("q") ?? "")) {
        updateParams({ q: search || null });
      }
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleCityChange(selection: CitySelection | null) {
    updateParams({
      cityLat: selection ? String(selection.lat) : null,
      cityLng: selection ? String(selection.lng) : null,
      cityLabel: selection ? selection.label : null,
    });
  }

  function clearAll() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="border-border bg-card/80 flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <CityPicker cityOptions={cityOptions} value={citySelection} onChange={handleCityChange} />

        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, city, or destination"
            aria-label="Search rides by title, city, or destination"
            className="pl-9"
          />
        </div>

        <Select value={sort} onValueChange={(value) => updateParams({ sort: value })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-between gap-2 sm:w-auto"
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Filters
            {advancedFilterCount > 0 && <Badge>{advancedFilterCount}</Badge>}
          </span>
          <ChevronDown className={cn("size-4 transition-transform", filtersOpen && "rotate-180")} />
        </Button>
      </div>

      {filtersOpen && (
        <div className="border-border flex flex-col gap-4 border-t pt-4">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Ride type</Label>
            <ToggleGroup
              multiple
              variant="outline"
              spacing={0}
              value={rideTypes}
              onValueChange={(value) =>
                updateParams({ types: value.length ? value.join(",") : null })
              }
              className="flex-wrap"
            >
              {RIDE_TYPES.map((type) => (
                <ToggleGroupItem key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground w-20 shrink-0 text-xs">Category</span>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[pricing || "any"]}
                onValueChange={(value) => {
                  const next = value[value.length - 1];
                  updateParams({ pricing: !next || next === "any" ? null : next });
                }}
                className="flex-wrap"
              >
                <ToggleGroupItem value="any" className="text-xs">
                  All
                </ToggleGroupItem>
                {PRICING_OPTIONS.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground w-20 shrink-0 text-xs">Speed</span>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[speed || "any"]}
                onValueChange={(value) => {
                  const next = value[value.length - 1];
                  updateParams({ speed: !next || next === "any" ? null : next });
                }}
                className="flex-wrap"
              >
                <ToggleGroupItem value="any" className="text-xs">
                  Any
                </ToggleGroupItem>
                {SPEED_LEVELS.map((level) => (
                  <ToggleGroupItem key={level.value} value={level.value} className="text-xs">
                    {level.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground w-20 shrink-0 text-xs">Difficulty</span>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[difficulty || "any"]}
                onValueChange={(value) => {
                  const next = value[value.length - 1];
                  updateParams({ difficulty: !next || next === "any" ? null : next });
                }}
                className="flex-wrap"
              >
                <ToggleGroupItem value="any" className="text-xs">
                  Any
                </ToggleGroupItem>
                {RIDER_LEVELS.map((level) => (
                  <ToggleGroupItem key={level.value} value={level.value} className="text-xs">
                    {level.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-distance" className="text-muted-foreground text-xs">
                Ride distance
              </Label>
              <Select
                value={distance}
                onValueChange={(value) =>
                  updateParams({ distance: value === "any" ? null : value })
                }
              >
                <SelectTrigger id="filter-distance" className="w-full">
                  <SelectValue placeholder="Any distance" />
                </SelectTrigger>
                <SelectContent>
                  {DISTANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-xs">Date range</Label>
              <div className="flex items-center">
                <Input
                  type="date"
                  aria-label="From date"
                  value={dateFrom}
                  onChange={(event) => updateParams({ from: event.target.value || null })}
                  className="rounded-r-none"
                />
                <span className="border-input text-muted-foreground flex h-8 shrink-0 items-center border-y px-1.5 text-xs">
                  to
                </span>
                <Input
                  type="date"
                  aria-label="To date"
                  value={dateTo}
                  onChange={(event) => updateParams({ to: event.target.value || null })}
                  className="rounded-l-none border-l-0"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="open-seats-only"
                checked={openSeatsOnly}
                onCheckedChange={(checked) => updateParams({ seats: checked ? "1" : null })}
              />
              <Label htmlFor="open-seats-only" className="text-sm font-normal">
                Open seats only
              </Label>
            </div>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
