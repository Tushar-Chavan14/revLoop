import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/design-system/state-panel";
import { Logo } from "@/components/logo";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />
      <EmptyState
        title="That Link's Run Out Of Road"
        description="It's expired or already used — request a fresh one to sign in."
        action={<Button nativeButton={false} render={<Link href="/login">Back To Sign In</Link>} />}
        className="border-none"
      />
    </div>
  );
}
