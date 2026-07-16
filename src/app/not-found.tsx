import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/design-system/state-panel";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />
      <EmptyState
        icon={Compass}
        title="This road doesn't go anywhere"
        description="The page you're looking for took a wrong turn. Let's get you back on route."
        action={
          <div className="flex gap-2">
            <Button nativeButton={false} render={<Link href="/">Back home</Link>} />
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/rides">Discover rides</Link>}
            />
          </div>
        }
        className="border-none"
      />
    </div>
  );
}
