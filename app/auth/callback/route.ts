import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/reset-password";

  console.log("Auth callback params:", { code: code ? "present" : "missing", next });

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log("Code exchange successful, redirecting to:", next);
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Code exchange failed:", error);
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  console.log("No code provided, redirecting to error");
  return NextResponse.redirect(`${origin}/auth/error?error=No%20authorization%20code%20provided`);
}