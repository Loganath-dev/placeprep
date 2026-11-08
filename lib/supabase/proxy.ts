import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./config";
import { supabaseCookieOptions } from "./cookie-options";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabasePublicConfig();
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard")
    || request.nextUrl.pathname.startsWith("/learning")
    || request.nextUrl.pathname.startsWith("/onboarding")
    || request.nextUrl.pathname.startsWith("/settings");
  const isAuthPage = ["/login", "/signup"].includes(request.nextUrl.pathname);

  if (!config) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?error=configuration";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient<Database>(config.url, config.key, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser validates the token with Supabase and refreshes the cookie session.
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    if (!isProtected) return response;
  }

  function redirectWithSession(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname);
    url.searchParams.set("error", "session");
    return redirectWithSession(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectWithSession(url);
  }

  return response;
}
