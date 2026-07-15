import {
  type LucideIcon,
  Bike,
  Building2,
  CalendarDays,
  Coffee,
  Compass,
  Moon,
  MountainSnow,
  Route,
  Trees,
} from "lucide-react";

export const RIDE_TYPES = [
  { value: "breakfast_ride", label: "Breakfast Ride" },
  { value: "weekend_ride", label: "Weekend Ride" },
  { value: "night_ride", label: "Night Ride" },
  { value: "touring", label: "Touring" },
  { value: "adventure", label: "Adventure" },
  { value: "off_road", label: "Off-road" },
  { value: "city_ride", label: "City Ride" },
  { value: "mountain_ride", label: "Mountain Ride" },
] as const;

export const RIDE_TYPE_ICONS: Record<string, LucideIcon> = {
  breakfast_ride: Coffee,
  weekend_ride: CalendarDays,
  night_ride: Moon,
  touring: Route,
  adventure: Compass,
  off_road: Trees,
  city_ride: Building2,
  mountain_ride: MountainSnow,
};

export const DEFAULT_RIDE_TYPE_ICON: LucideIcon = Bike;
