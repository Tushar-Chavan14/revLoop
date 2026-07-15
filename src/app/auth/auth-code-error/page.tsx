import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Sign-in link expired</h1>
      <p className="text-muted-foreground max-w-sm">
        That link is invalid or has expired. Request a new one to continue.
      </p>
      <Button nativeButton={false} render={<Link href="/login">Back to login</Link>} />
    </div>
  );
}
