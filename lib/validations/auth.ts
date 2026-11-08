import { z } from "zod";

const email = z.email("Enter a valid email address.").trim().toLowerCase();
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a symbol.");

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  email,
  password,
  confirmPassword: z.string(),
  acceptedTerms: z.literal("on", "Accept the Terms and Privacy Policy to continue."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password.") });
export const emailSchema = z.object({ email });
export const oauthConsentSchema = z.object({
  acceptedTerms: z.literal("on", "Accept the Terms and Privacy Policy to continue."),
});
export const resetPasswordSchema = z.object({ password, confirmPassword: z.string() }).refine(
  (values) => values.password === values.confirmPassword,
  { message: "Passwords do not match.", path: ["confirmPassword"] },
);

export type AuthFormState = { error?: string; success?: string } | undefined;

export function safeNextPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("\\")) {
    return "/dashboard";
  }
  const target = new URL(value, "https://studybench.invalid");
  if (target.origin !== "https://studybench.invalid") return "/dashboard";
  return `${target.pathname}${target.search}${target.hash}`;
}
