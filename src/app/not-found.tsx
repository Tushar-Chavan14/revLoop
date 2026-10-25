import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-16 text-center sm:px-6">
      <Logo />
      <div className="flex max-w-md flex-col items-center gap-3">
        <h1 className="font-display text-6xl leading-[0.9] text-balance sm:text-7xl">
          This road doesn&apos;t go anywhere
        </h1>
        <p className="text-muted-foreground text-base">
          The page you&apos;re looking for took a wrong turn. Let&apos;s get you back on route.
        </p>
      </div>
      <div className="flex gap-2">
        <Button nativeButton={false} render={<Link href="/">Back home</Link>} />
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/rides">Discover rides</Link>}
        />
      </div>
    </div>
  );
}
