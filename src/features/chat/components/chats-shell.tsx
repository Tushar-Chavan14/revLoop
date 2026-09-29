"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatsShellProps {
  heading: React.ReactNode;
  list: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Two-pane Crew Chats layout: list + open chat side by side on desktop. On
 * mobile it's one screen at a time — the list, or the chat you tapped into.
 */
export function ChatsShell({ heading, list, children }: ChatsShellProps) {
  const chatOpen = useSelectedLayoutSegment() !== null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className={cn(chatOpen && "hidden lg:block")}>{heading}</div>
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className={cn("flex min-w-0 flex-col gap-4", chatOpen && "hidden lg:flex")}>
          {list}
        </aside>
        <section className={cn("min-w-0 flex-col", chatOpen ? "flex" : "hidden lg:flex")}>
          {children}
        </section>
      </div>
    </div>
  );
}
