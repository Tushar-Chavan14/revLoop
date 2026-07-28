import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { BottomNav } from "@/components/design-system/bottom-nav";
import { TimezoneSync } from "@/components/timezone-sync";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants/site";
import { bebasNeue, inter, manrope } from "./fonts";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      className={`${inter.variable} ${manrope.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-16 sm:pb-0">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <BottomNav />
          <Toaster />
          <TimezoneSync />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
