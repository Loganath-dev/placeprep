export function getSupabasePublicConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !key) return null;

  try {
    const parsedUrl = new URL(rawUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
    if (parsedUrl.username || parsedUrl.password) return null;
    if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") return null;
    return { url: parsedUrl.origin, key };
  } catch {
    return null;
  }
}
