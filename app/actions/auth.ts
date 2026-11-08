"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  emailSchema,
  loginSchema,
  oauthConsentSchema,
  resetPasswordSchema,
  safeNextPath,
  signupSchema,
  type AuthFormState,
} from "@/lib/validations/auth";

function formObject(formData: FormData, fields: string[]) {
  return Object.fromEntries(fields.map((field) => [field, formData.get(field)]));
}

function configurationError(): AuthFormState {
  return { error: "Authentication is not configured yet. Add the Supabase public URL and key to the environment." };
}

export async function signUp(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse(formObject(formData, ["fullName", "email", "password", "confirmPassword", "acceptedTerms"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/dashboard`,
        data: { full_name: parsed.data.fullName },
      },
    });
    if (error) {
      const message = error.message.toLowerCase().includes("already registered")
        ? "An account already exists for this email. Try logging in instead."
        : error.message.toLowerCase().includes("password")
          ? "That password does not meet the account security requirements."
          : "We could not create your account. Check your details and try again.";
      return { error: message };
    }
    return { success: "Check your inbox for a verification link to finish creating your account." };
  } catch {
    return configurationError();
  }
}

export async function logIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(formObject(formData, ["email", "password"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter your email and password." };
  const next = safeNextPath(formData.get("next"));
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: "Email or password is incorrect." };
  } catch {
    return configurationError();
  }
  redirect(next);
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const consent = oauthConsentSchema.safeParse(formObject(formData, ["acceptedTerms"]));
  if (!consent.success) redirect("/login?error=terms");
  const next = safeNextPath(formData.get("next"));
  let oauthUrl: string | undefined;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (!error) oauthUrl = data.url;
  } catch {
    redirect("/login?error=configuration");
  }
  if (!oauthUrl) redirect("/login?error=oauth");
  redirect(oauthUrl);
}

export async function requestPasswordReset(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(formObject(formData, ["email"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/reset-password`,
    });
    if (error) return { error: "We could not send a reset link. Please try again shortly." };
    return { success: "If an account exists for that email, a reset link is on its way." };
  } catch {
    return configurationError();
  }
}

export async function updatePassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse(formObject(formData, ["password", "confirmPassword"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your new password." };
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "This reset link is invalid or has expired. Request a new one." };
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { error: "We could not update your password. Request a new reset link and try again." };
  } catch {
    return configurationError();
  }
  redirect("/dashboard");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
