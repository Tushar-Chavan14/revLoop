import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { BottomNav } from "@/components/design-system/bottom-nav";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants/site";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Condensed poster/road-sign type for hero statements only — gives the
// brand a "moto club" energy instead of reading as a generic SaaS product.
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-16 sm:pb-0">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <BottomNav />
          <Toaster />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
