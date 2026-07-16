import { Toast } from "@base-ui/react/toast";

const { createToastManager } = Toast;

export type ToastVariant = "default" | "success" | "warning" | "error";

interface ToastOptions {
  title: string;
  description?: string;
}

/**
 * Module-level manager (not a React context) so any client component —
 * server action callback, form handler, realtime listener — can fire a
 * toast without being wrapped in a provider. <Toaster> in the root layout
 * renders whatever this manager emits.
 */
export const toastManager = createToastManager();

function fire(type: ToastVariant) {
  return ({ title, description }: ToastOptions) =>
    toastManager.add({ title, description, type, timeout: type === "error" ? 6000 : 4000 });
}

export const toast = Object.assign(fire("default"), {
  success: fire("success"),
  warning: fire("warning"),
  error: fire("error"),
});
