import { Bebas_Neue, Manrope } from "next/font/google";

// Everything a rider reads or taps — body, UI, headings, figures. One family
// keeps the catalogue below the billboard quiet; Manrope's geometric warmth
// reads as riding gear rather than a dashboard kit.
export const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

// Poster display — the billboard tier only (hero sentence, landing section
// titles, page titles, the milestone). All caps by design.
export const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});
