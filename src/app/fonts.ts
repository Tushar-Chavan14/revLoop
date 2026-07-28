import { Bebas_Neue, Inter, Manrope } from "next/font/google";

// Body copy — long-form readability.
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// UI headings / labels — Manrope's geometric warmth reads "premium outdoor
// gear" (Peak Design / Garmin) rather than generic dashboard Inter.
export const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

// Poster display — hero statements only. All-caps by design.
export const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});
