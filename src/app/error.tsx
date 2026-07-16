"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/design-system/state-panel";
import { Logo } from "@/components/logo";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />
      <ErrorState
        title="Something went wrong"
        description="That wasn't supposed to happen. Try again, or head back home."
        action={
          <div className="flex gap-2">
            <Button onClick={() => unstable_retry()}>Try again</Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/">Back home</Link>}
            />
          </div>
        }
        className="border-none"
      />
    </div>
  );
}
