"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { AlertTriangle, CheckCircle2, Info, XCircle, XIcon } from "lucide-react";

import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

const TOAST_ICONS = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
} as const;

const TOAST_ICON_STYLES = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
} as const;

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => {
    const type = (toastItem.type ?? "default") as keyof typeof TOAST_ICONS;
    const Icon = TOAST_ICONS[type] ?? Info;

    return (
      <ToastPrimitive.Root
        key={toastItem.id}
        toast={toastItem}
        className={cn(
          "bg-card text-card-foreground ring-foreground/10 flex w-full items-start gap-3 rounded-2xl p-4 shadow-xl ring-1 select-none",
          "data-starting-style:translate-y-2 data-starting-style:opacity-0",
          "data-ending-style:translate-y-1 data-ending-style:opacity-0",
          "data-swiping:transition-none",
          "transition-all duration-300 ease-out",
        )}
      >
        <Icon className={cn("mt-0.5 size-5 shrink-0", TOAST_ICON_STYLES[type])} aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastPrimitive.Title className="text-sm font-semibold" />
          <ToastPrimitive.Description className="text-muted-foreground text-sm" />
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss"
          className="text-muted-foreground hover:bg-muted hover:text-foreground -m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          <XIcon className="size-3.5" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    );
  });
}

/** Mount once near the root layout. Toasts are fired from anywhere via `toast()` in `@/lib/toast`. */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed inset-x-0 bottom-0 z-60 mx-auto flex w-full max-w-sm flex-col-reverse gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
