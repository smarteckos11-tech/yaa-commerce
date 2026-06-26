import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase session on every server request.
 * Only runs on /admin/* routes to avoid breaking public pages.
 */
export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://placeholder.supabase.co") {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session — wrapped in try-catch to avoid breaking pages
    await supabase.auth.getUser();
  } catch (error) {
    // Silently fail — the page will still render, just without auth
    console.warn("[Middleware] Auth refresh failed:", error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Only run middleware on admin routes (where auth matters).
     * Public routes (/, /login, /signup, /cart, /checkout, /b/*, /contact, /demo)
     * don't need session refresh.
     */
    "/admin/:path*",
  ],
};
