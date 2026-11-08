// Supabase SSR uses cookies in both the browser and server clients. Keep the
// cookie readable by the SDK, but require HTTPS for production deployments.
export const supabaseCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
