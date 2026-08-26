"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="flex gap-2.5 rounded-sm border border-alert/25 bg-alert-soft p-3 text-[0.8125rem] text-alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{state.error}</span>
        </div>
      )}

      <Field label="Email address" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="dark" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" /> Sign in
        </>
      )}
    </Button>
  );
}
