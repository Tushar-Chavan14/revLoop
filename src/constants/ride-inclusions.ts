export const RIDE_INCLUSIONS = [
  { value: "accommodation", label: "Accommodation" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
  { value: "fuel", label: "Fuel" },
  { value: "toll", label: "Toll" },
  { value: "parking", label: "Parking" },
  { value: "guide", label: "Guide" },
  { value: "photographer", label: "Photographer" },
  { value: "support_vehicle", label: "Support vehicle" },
  { value: "luggage_support", label: "Luggage support" },
  { value: "mechanical_support", label: "Mechanical support" },
  { value: "first_aid", label: "First aid" },
] as const;

export type RideInclusion = (typeof RIDE_INCLUSIONS)[number]["value"];
