import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validations/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (!code) {
    const providerDenied = request.nextUrl.searchParams.has("error");
    return NextResponse.redirect(new URL(providerDenied ? "/login?error=oauth" : "/login?error=callback", request.url));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login?error=callback", request.url));
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }
}
