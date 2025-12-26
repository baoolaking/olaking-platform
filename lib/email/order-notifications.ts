import { getEmailService } from "./service";

export interface OrderEmailData {
  orderId: string;
  userEmail: string;
  userName: string;
  orderDetails: {
    platform: string;
    serviceType: string;
    quantity: number;
    totalPrice: number;
    link: string;
    paymentMethod: string;
  };
  adminNotes?: string;
}

/**
 * Send order status change notification to user
 */
export async function sendOrderStatusNotification(
  status: string,
  orderData: OrderEmailData
) {
  const emailService = getEmailService();
  
  const { subject, html } = getEmailTemplate(status, orderData);
  
  await emailService.sendEmail({
    to: orderData.userEmail,
    subject,
    html,
    from: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@baoolaking.com",
  });
}

/**
 * Get email template based on order status
 */
function getEmailTemplate(status: string, orderData: OrderEmailData): { subject: string; html: string } {
  const { orderId, userName, orderDetails, adminNotes } = orderData;
  
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
      .content { background: white; padding: 30px 20px; border: 1px solid #e9ecef; border-top: none; }
      .order-details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
      .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
      .amount { font-size: 18px; font-weight: bold; color: #28a745; }
      .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d; }
      .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
      .btn:hover { background: #0056b3; }
    </style>
  `;

  switch (status) {
    case "pending":
      return {
        subject: `Order Confirmed - ${orderId} | BAO OLAKING`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Confirmed</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ Order Confirmed!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order is now being processed</p>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Great news! Your order has been confirmed and is now being processed by our team.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #495057;">📋 Order Details</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Service:</strong> ${formatServiceName(orderDetails.platform, orderDetails.serviceType)}</li>
                    <li><strong>Quantity:</strong> ${orderDetails.quantity.toLocaleString()}</li>
                    <li><strong>Amount:</strong> <span class="amount">₦${orderDetails.totalPrice.toLocaleString()}</span></li>
                    <li><strong>Target URL:</strong> ${orderDetails.link}</li>
                    <li><strong>Status:</strong> <span class="status-badge" style="background: #ffc107; color: #212529;">Processing</span></li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
                  <p style="margin: 0;"><strong>📝 Admin Note:</strong> ${adminNotes}</p>
                </div>
                ` : ''}
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our team will start processing your order within 24 hours</li>
                  <li>You'll receive another email when your order is completed</li>
                  <li>You can track your order status in your dashboard</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="btn">View Order Status</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing BAO OLAKING!</p>
                <p>Need help? Contact us at ${process.env.RESEND_ADMIN_EMAIL || 'support@baoolaking.com'}</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "completed":
      return {
        subject: `Order Completed - ${orderId} | BAO OLAKING`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Completed</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Order Completed!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order has been successfully delivered</p>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Excellent! Your order has been completed successfully. The ${formatServiceName(orderDetails.platform, orderDetails.serviceType)} have been delivered to your content.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #495057;">📋 Order Summary</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Service:</strong> ${formatServiceName(orderDetails.platform, orderDetails.serviceType)}</li>
                    <li><strong>Quantity Delivered:</strong> ${orderDetails.quantity.toLocaleString()}</li>
                    <li><strong>Target URL:</strong> ${orderDetails.link}</li>
                    <li><strong>Status:</strong> <span class="status-badge" style="background: #28a745; color: white;">Completed</span></li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
                  <p style="margin: 0;"><strong>📝 Completion Note:</strong> ${adminNotes}</p>
                </div>
                ` : ''}
                
                <p><strong>🎯 What to expect:</strong></p>
                <ul>
                  <li>The delivery has been completed to your specified URL</li>
                  <li>Results should be visible on your content now</li>
                  <li>If you have any issues, please contact our support team</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/services" class="btn">Order More Services</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing BAO OLAKING! We appreciate your business.</p>
                <p>Need help? Contact us at ${process.env.RESEND_ADMIN_EMAIL || 'support@baoolaking.com'}</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "failed":
      return {
        subject: `Order Issue - ${orderId} | BAO OLAKING`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Issue</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);">
                <h1 style="margin: 0;">⚠️ Order Issue</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">There was an issue with your order</p>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>We encountered an issue while processing your order. Our team is working to resolve this and will update you shortly.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #495057;">📋 Order Details</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Service:</strong> ${formatServiceName(orderDetails.platform, orderDetails.serviceType)}</li>
                    <li><strong>Quantity:</strong> ${orderDetails.quantity.toLocaleString()}</li>
                    <li><strong>Target URL:</strong> ${orderDetails.link}</li>
                    <li><strong>Status:</strong> <span class="status-badge" style="background: #dc3545; color: white;">Issue Detected</span></li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
                  <p style="margin: 0;"><strong>📝 Issue Details:</strong> ${adminNotes}</p>
                </div>
                ` : ''}
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our support team will investigate the issue</li>
                  <li>We'll either retry the order or process a refund</li>
                  <li>You'll receive an update within 24 hours</li>
                  <li>If payment was made, it will be refunded if we cannot complete the order</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="btn" style="background: #dc3545;">View Order Details</a>
                </div>
              </div>
              
              <div class="footer">
                <p>We apologize for any inconvenience. Our team is working to resolve this quickly.</p>
                <p>Need immediate help? Contact us at ${process.env.RESEND_ADMIN_EMAIL || 'support@baoolaking.com'}</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "awaiting_refund":
      return {
        subject: `Refund Processing - ${orderId} | BAO OLAKING`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Refund Processing</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);">
                <h1 style="margin: 0;">💰 Refund Processing</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your refund is being processed</p>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>We're processing a refund for your order. The refund will be credited back to your wallet or original payment method.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #495057;">📋 Refund Details</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Service:</strong> ${formatServiceName(orderDetails.platform, orderDetails.serviceType)}</li>
                    <li><strong>Refund Amount:</strong> <span class="amount">₦${orderDetails.totalPrice.toLocaleString()}</span></li>
                    <li><strong>Payment Method:</strong> ${orderDetails.paymentMethod === 'wallet' ? 'Wallet' : 'Bank Transfer'}</li>
                    <li><strong>Status:</strong> <span class="status-badge" style="background: #f39c12; color: white;">Processing Refund</span></li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #f39c12;">
                  <p style="margin: 0;"><strong>📝 Refund Reason:</strong> ${adminNotes}</p>
                </div>
                ` : ''}
                
                <p><strong>Refund Timeline:</strong></p>
                <ul>
                  <li><strong>Wallet Payment:</strong> Refund will be credited to your wallet immediately</li>
                  <li><strong>Bank Transfer:</strong> Refund will be processed within 3-5 business days</li>
                  <li>You'll receive a confirmation email once the refund is completed</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet" class="btn" style="background: #f39c12;">Check Wallet</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for your patience while we process your refund.</p>
                <p>Questions? Contact us at ${process.env.RESEND_ADMIN_EMAIL || 'support@baoolaking.com'}</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "refunded":
      return {
        subject: `Refund Completed - ${orderId} | BAO OLAKING`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Refund Completed</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                <h1 style="margin: 0;">✅ Refund Completed</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your refund has been processed successfully</p>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Your refund has been completed successfully! The amount has been credited back to your ${orderDetails.paymentMethod === 'wallet' ? 'wallet' : 'bank account'}.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #495057;">📋 Refund Summary</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Refunded Amount:</strong> <span class="amount">₦${orderDetails.totalPrice.toLocaleString()}</span></li>
                    <li><strong>Refund Method:</strong> ${orderDetails.paymentMethod === 'wallet' ? 'Wallet Credit' : 'Bank Transfer'}</li>
                    <li><strong>Status:</strong> <span class="status-badge" style="background: #28a745; color: white;">Refund Completed</span></li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
                  <p style="margin: 0;"><strong>📝 Refund Note:</strong> ${adminNotes}</p>
                </div>
                ` : ''}
                
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>${orderDetails.paymentMethod === 'wallet' ? 'Check your wallet balance - the refund is available immediately' : 'The refund should appear in your bank account within 3-5 business days'}</li>
                  <li>You can place new orders anytime from your dashboard</li>
                  <li>Contact us if you have any questions about this refund</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/services" class="btn">Browse Services</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for your understanding. We hope to serve you better in the future!</p>
                <p>Need help? Contact us at ${process.env.RESEND_ADMIN_EMAIL || 'support@baoolaking.com'}</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    default:
      return {
        subject: `Order Update - ${orderId} | BAO OLAKING`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Update</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📋 Order Update</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order status has been updated</p>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Your order status has been updated. Please check your dashboard for the latest information.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #495057;">📋 Order Details</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Service:</strong> ${formatServiceName(orderDetails.platform, orderDetails.serviceType)}</li>
                    <li><strong>New Status:</strong> <span class="status-badge" style="background: #6c757d; color: white;">${status.replace('_', ' ').toUpperCase()}</span></li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
                  <p style="margin: 0;"><strong>📝 Update Note:</strong> ${adminNotes}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="btn">View Order Details</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing BAO OLAKING!</p>
                <p>Need help? Contact us at ${process.env.RESEND_ADMIN_EMAIL || 'support@baoolaking.com'}</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
  }
}

/**
 * Format service name for display
 */
function formatServiceName(platform: string, serviceType: string): string {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const serviceName = serviceType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return `${platformName} ${serviceName}`;
}