"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-16 text-center sm:px-6">
      <Logo />
      <div className="flex max-w-md flex-col items-center gap-3">
        <h1 className="font-display text-6xl leading-[0.9] text-balance sm:text-7xl">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-base">
          That wasn&apos;t supposed to happen. Try again, or head back home.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => unstable_retry()}>Try again</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/">Back home</Link>} />
      </div>
    </div>
  );
}
