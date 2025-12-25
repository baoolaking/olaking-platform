import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { getEmailService } from "@/lib/email/service";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Forgot password request for:", body.identifier);
    
    const { identifier } = forgotPasswordSchema.parse(body);

    const adminClient = createAdminClient();
    
    // Look up user by identifier (username, email, or WhatsApp)
    const { data: userRecord, error: lookupError } = await adminClient
      .from("users")
      .select("id, email, username, full_name, is_active")
      .or(`username.eq.${identifier},whatsapp_no.eq.${identifier},email.eq.${identifier}`)
      .single();

    console.log("User lookup result:", { userRecord, lookupError });

    if (lookupError || !userRecord) {
      console.log("User not found for identifier:", identifier);
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account with that identifier exists, a password reset email has been sent." },
        { status: 200 }
      );
    }

    if (!userRecord.is_active) {
      console.log("Account inactive for user:", userRecord.email);
      return NextResponse.json(
        { message: "Account is inactive. Please contact support." },
        { status: 400 }
      );
    }

    console.log("Sending password reset email to:", userRecord.email);

    // Create a regular Supabase client for auth operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use regular Supabase client to send password reset email
    // The redirect URL will come from the email template
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      userRecord.email
    );

    console.log("Reset password result:", { resetError });

    if (resetError) {
      console.error("Password reset error:", resetError);
      return NextResponse.json(
        { message: `Failed to send password reset email: ${resetError.message}` },
        { status: 500 }
      );
    }

    console.log("Password reset email sent successfully");

    return NextResponse.json(
      { message: "If an account with that identifier exists, a password reset email has been sent." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}