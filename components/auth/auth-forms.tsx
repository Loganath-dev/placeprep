"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import {
  logIn,
  requestPasswordReset,
  signInWithGoogle,
  signUp,
  updatePassword,
} from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validations/auth";

function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
      <section className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><GraduationCap size={19} /></span>
          StudyBench
        </Link>
        <div data-ui="auth-form" className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}

function FormFeedback({ state }: { state: AuthFormState }) {
  if (!state?.error && !state?.success) return null;
  const success = Boolean(state.success);
  return (
    <p role={success ? "status" : "alert"} className={`rounded-lg border px-3 py-2.5 text-sm leading-5 ${success ? "border-pass/30 bg-pass/5 text-pass" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
      {state.success ?? state.error}
    </p>
  );
}

function Field({ label, name, type = "text", autoComplete, required = true }: { label: string; name: string; type?: string; autoComplete?: string; required?: boolean }) {
  const [visible, setVisible] = useState(false);
  const secret = type === "password";
  return (
    <label className={`block space-y-2 text-sm font-medium ${label ? "" : "sr-only"}`} htmlFor={name}>
      {label || "Password"}
      <span className="relative block">
        <input id={name} name={name} type={secret && visible ? "text" : type} autoComplete={autoComplete} required={required} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
        {secret && <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>}
      </span>
    </label>
  );
}

function Submit({ children, pending }: { children: string; pending: boolean }) {
  return <button disabled={pending} className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{pending ? "Please wait…" : children}</button>;
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, undefined);
  return <AuthShell title="Create your free account" description="Build a clear placement preparation roadmap around your goals.">
    {state?.success ? <FormFeedback state={state} /> : <form action={action} className="space-y-5">
      <FormFeedback state={state} />
      <Field label="Full name" name="fullName" autoComplete="name" />
      <Field label="Email address" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" />
      <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
      <label className="flex items-start gap-2.5 text-sm leading-5 text-muted-foreground">
        <input name="acceptedTerms" type="checkbox" required className="mt-1 size-4 rounded border-input accent-primary" />
        <span>I agree to the <Link className="text-foreground underline underline-offset-4" href="/terms">Terms of Service</Link> and <Link className="text-foreground underline underline-offset-4" href="/privacy">Privacy Policy</Link>.</span>
      </label>
      <Submit pending={pending}>Create account</Submit>
    </form>}
    <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Log in</Link></p>
  </AuthShell>;
}

export function LoginForm({ next = "/dashboard", error }: { next?: string; error?: string }) {
  const [state, action, pending] = useActionState(logIn, undefined);
  const routeError = error === "configuration"
    ? "Authentication is not configured yet. Add the Supabase public URL and key to the environment."
    : error === "terms"
      ? "Accept the Terms and Privacy Policy before continuing with Google."
      : error === "session"
        ? "Your session could not be verified. Please log in again."
        : error === "oauth" || error === "callback"
          ? "Google sign-in could not be completed. Please try again."
          : undefined;
  return <AuthShell title="Welcome back" description="Pick up where your placement preparation left off.">
    <form action={action} className="space-y-5">
      <FormFeedback state={state ?? (routeError ? { error: routeError } : undefined)} />
      <input type="hidden" name="next" value={next} />
      <Field label="Email address" name="email" type="email" autoComplete="email" />
      <div className="space-y-2"><div className="flex justify-between"><span className="text-sm font-medium">Password</span><Link href="/forgot-password" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Forgot password?</Link></div><Field label="" name="password" type="password" autoComplete="current-password" /></div>
      <Submit pending={pending}>Log in</Submit>
    </form>
    <p className="my-5 text-center text-sm text-muted-foreground">Or continue with Google</p>
    <form action={signInWithGoogle} className="space-y-3"><input type="hidden" name="next" value={next} /><label className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground"><input name="acceptedTerms" type="checkbox" required className="mt-1 size-4 rounded border-input accent-primary" /><span>I agree to the <Link className="text-foreground underline underline-offset-4" href="/terms">Terms of Service</Link> and <Link className="text-foreground underline underline-offset-4" href="/privacy">Privacy Policy</Link>.</span></label><button className="h-11 w-full rounded-lg border border-border bg-card text-sm font-medium transition-colors hover:bg-muted">Continue with Google</button></form>
    <p className="mt-6 text-center text-sm text-muted-foreground">New to StudyBench? <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">Create an account</Link></p>
  </AuthShell>;
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return <AuthShell title="Reset your password" description="We’ll email a secure link if an account matches that address.">
    <form action={action} className="space-y-5"><FormFeedback state={state} /><Field label="Email address" name="email" type="email" autoComplete="email" /><Submit pending={pending}>Send reset link</Submit></form>
    <p className="mt-6 text-center text-sm"><Link href="/login" className="text-muted-foreground underline underline-offset-4">Back to log in</Link></p>
  </AuthShell>;
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  return <AuthShell title="Choose a new password" description="Use at least eight characters with upper and lowercase letters, a number, and a symbol.">
    <form action={action} className="space-y-5"><FormFeedback state={state} /><Field label="New password" name="password" type="password" autoComplete="new-password" /><Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" /><Submit pending={pending}>Update password</Submit></form>
  </AuthShell>;
}
