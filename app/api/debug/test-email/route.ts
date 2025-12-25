import { NextRequest, NextResponse } from "next/server";
import { sendWalletFundingNotification } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return NextResponse.json({ error: "Test email address required" }, { status: 400 });
    }

    console.log("🧪 Testing email service with:", testEmail);

    // Test the email service
    await sendWalletFundingNotification({
      orderId: "test-order-123",
      userEmail: "test-user@example.com",
      userName: "Test User",
      amount: 5000,
      adminEmail: testEmail,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      testEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  // Check email service configuration
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.RESEND_ADMIN_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  return NextResponse.json({
    configured: {
      resendApiKey: !!resendApiKey,
      adminEmail: !!adminEmail,
      fromEmail: !!fromEmail
    },
    values: {
      adminEmail: adminEmail || "Not set",
      fromEmail: fromEmail || "Not set",
      apiKeyLength: resendApiKey ? resendApiKey.length : 0
    }
  });
}