/**
 * Email service utility for sending notifications
 * This is a basic implementation that can be extended with actual email providers
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailService {
  sendEmail(payload: EmailPayload): Promise<void>;
}

/**
 * Console Email Service - for development/testing
 * Logs emails to console instead of sending them
 */
class ConsoleEmailService implements EmailService {
  async sendEmail(payload: EmailPayload): Promise<void> {
    console.log("📧 Email would be sent:");
    console.log("To:", payload.to);
    console.log("Subject:", payload.subject);
    console.log("From:", payload.from || "noreply@example.com");
    console.log("HTML Content:", payload.html);
  }
}

/**
 * Resend Email Service - for production
 */
class ResendEmailService implements EmailService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendEmail(payload: EmailPayload): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from || 'noreply@example.com',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorData}`);
    }
    
    const result = await response.json();
    console.log("📧 Email sent successfully via Resend:", result.id);
  }
}

/**
 * Get the configured email service
 * Returns ResendEmailService if API key is available, otherwise ConsoleEmailService
 */
export function getEmailService(): EmailService {
  // Check for Resend API key first
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    console.log("📧 Using Resend email service");
    return new ResendEmailService(resendApiKey);
  }
  
  // Fallback to console service for development/testing
  console.log("📧 Using console email service (no API key found)");
  return new ConsoleEmailService();
}

/**
 * Send admin notification email for service order payment confirmation
 */
export async function sendServiceOrderNotification({
  orderId,
  userEmail,
  userName,
  amount,
  serviceName,
  adminEmail,
}: {
  orderId: string;
  userEmail: string;
  userName: string;
  amount: number;
  serviceName: string;
  adminEmail: string;
}) {
  const emailService = getEmailService();
  
  const subject = `Service Order Payment Confirmation - Order ${orderId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Service Order Payment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .order-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .amount { font-size: 18px; font-weight: bold; color: #28a745; }
        .steps { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; }
        .steps ol { margin: 10px 0; padding-left: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #495057;">🛒 Service Order Payment Confirmation</h1>
        </div>
        
        <div class="content">
          <p>A customer has confirmed they have sent payment for a service order and is awaiting verification.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Order:</strong> ${orderId}</li>
              <li><strong>Customer:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Service:</strong> ${serviceName}</li>
              <li><strong>Amount:</strong> <span class="amount">₦${amount.toLocaleString()}</span></li>
              <li><strong>Status:</strong> Awaiting Confirmation</li>
            </ul>
          </div>
          
          <div class="steps">
            <p><strong>⚡ Next Steps:</strong></p>
            <ol>
              <li>Check your bank account for the payment of ₦${amount.toLocaleString()}</li>
              <li>Log into the admin panel</li>
              <li>Navigate to Orders → Service Orders</li>
              <li>Find order ${orderId} and verify the payment</li>
              <li>Update status to "pending" to start processing the order</li>
            </ol>
          </div>
          
          <p style="margin-bottom: 0;">Please process this confirmation as soon as possible to ensure good customer experience.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from your service order system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await emailService.sendEmail({
    to: adminEmail,
    subject,
    html,
    from: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@example.com",
  });
}

/**
 * Send admin notification email for wallet funding confirmation
 */
export async function sendWalletFundingNotification({
  orderId,
  userEmail,
  userName,
  amount,
  adminEmail,
}: {
  orderId: string;
  userEmail: string;
  userName: string;
  amount: number;
  adminEmail: string;
}) {
  const emailService = getEmailService();
  
  const subject = `Wallet Funding Payment Confirmation - Order ${orderId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Wallet Funding Payment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .order-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .amount { font-size: 18px; font-weight: bold; color: #28a745; }
        .steps { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; }
        .steps ol { margin: 10px 0; padding-left: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #495057;">🏦 Wallet Funding Payment Confirmation</h1>
        </div>
        
        <div class="content">
          <p>A user has confirmed they have sent payment for wallet funding and is awaiting verification.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Order:</strong> ${orderId}</li>
              <li><strong>User:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Amount:</strong> <span class="amount">₦${amount.toLocaleString()}</span></li>
              <li><strong>Status:</strong> Awaiting Confirmation</li>
            </ul>
          </div>
          
          <div class="steps">
            <p><strong>⚡ Next Steps:</strong></p>
            <ol>
              <li>Check your bank account for the payment of ₦${amount.toLocaleString()}</li>
              <li>Log into the admin panel</li>
              <li>Navigate to Orders → Wallet Funding</li>
              <li>Find order ${orderId} and verify the payment</li>
              <li>Update status to "pending" to credit the user's wallet</li>
            </ol>
          </div>
          
          <p style="margin-bottom: 0;">Please process this confirmation as soon as possible to ensure good user experience.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from your wallet funding system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await emailService.sendEmail({
    to: adminEmail,
    subject,
    html,
    from: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@example.com",
  });
}