import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/reset-password'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  console.log("🔍 Auth confirm received params:", { 
    token_hash: token_hash ? "present" : "missing",
    type,
    next,
    allParams: Object.fromEntries(searchParams.entries())
  });

  if (token_hash && type) {
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
              // Ignore cookie setting errors in server components
            }
          },
        },
      }
    );

    console.log("🔑 Verifying OTP with token_hash and type:", type);
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log("✅ OTP verification successful, redirecting to:", redirectTo.toString());
      return NextResponse.redirect(redirectTo)
    } else {
      console.error("❌ OTP verification failed:", error);
    }
  } else {
    console.log("❌ Missing token_hash or type parameters");
  }

  // return the user to an error page with some instructions
  console.log("❌ Redirecting to error page");
  redirectTo.pathname = '/auth/error'
  redirectTo.searchParams.set('error', 'Invalid or expired reset link')
  return NextResponse.redirect(redirectTo)
}