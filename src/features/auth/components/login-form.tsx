"use client";

import { useTransition } from "react";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle, signInWithMagicLink } from "@/features/auth/actions/auth-actions";
import { magicLinkSchema } from "@/features/auth/schema";

interface LoginFormProps {
  error?: string;
  message?: string;
}

export function LoginForm({ error, message }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: magicLinkSchema,
    onSubmit: (values) => {
      startTransition(() => {
        signInWithMagicLink(values.email);
      });
    },
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">OR</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={Boolean(formik.touched.email && formik.errors.email)}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-destructive text-sm">{formik.errors.email}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Send magic link"}
        </Button>
      </form>

      {message && <p className="text-muted-foreground text-sm">{message}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
