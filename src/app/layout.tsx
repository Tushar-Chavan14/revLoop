import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { BottomNav } from "@/components/design-system/bottom-nav";
import { TimezoneSync } from "@/components/timezone-sync";
import { AppInstallProvider } from "@/features/app-install/components/app-install-provider";
import { ChatActivityProvider } from "@/features/chat/components/chat-activity-provider";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants/site";
import { bebasNeue, inter, manrope } from "./fonts";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
  },
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
          <AppInstallProvider>
            <ChatActivityProvider>
              {children}
              <BottomNav />
              <Toaster />
              <TimezoneSync />
            </ChatActivityProvider>
          </AppInstallProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
