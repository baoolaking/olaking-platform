import { NextRequest, NextResponse } from "next/server";
import { sendWalletFundingNotification, getActiveAdminEmails } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    console.log("🧪 Testing email service");

    let adminEmails: string[];
    
    if (testEmail) {
      // Use provided test email
      adminEmails = [testEmail];
      console.log("Using provided test email:", testEmail);
    } else {
      // Use actual admin emails from database
      adminEmails = await getActiveAdminEmails();
      console.log("Using active admin emails:", adminEmails);
    }

    if (adminEmails.length === 0) {
      return NextResponse.json({ 
        error: "No admin emails found and no test email provided" 
      }, { status: 400 });
    }

    // Test the email service
    await sendWalletFundingNotification({
      orderId: "test-order-123",
      userEmail: "test-user@example.com",
      userName: "Test User",
      amount: 5000,
      adminEmails,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      adminEmails,
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
  try {
    // Check email service configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.RESEND_ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    // Get active admin emails from database
    const activeAdminEmails = await getActiveAdminEmails();

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
      },
      activeAdminEmails: {
        count: activeAdminEmails.length,
        emails: activeAdminEmails
      }
    });
  } catch (error) {
    console.error("Error getting email configuration:", error);
    return NextResponse.json({
      error: "Failed to get email configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}