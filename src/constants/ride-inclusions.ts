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
  { value: "support_vehicle", label: "Support Vehicle" },
  { value: "luggage_support", label: "Luggage Support" },
  { value: "mechanical_support", label: "Mechanical Support" },
  { value: "first_aid", label: "First Aid" },
] as const;

export type RideInclusion = (typeof RIDE_INCLUSIONS)[number]["value"];
