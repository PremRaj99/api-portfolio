import nodemailer from 'nodemailer';

function createTransporter() {
  const GMAIL_USER = process.env.GMAIL_USER || 'web.premraj@gmail.com';
  const rawPass = process.env.GMAIL_APP_PASSWORD || '';
  const GMAIL_APP_PASSWORD = rawPass.replace(/['"]/g, '').trim();

  if (!GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_APP_PASSWORD is not set. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendThankYouEmail({ name, email, projectType, message }) {
  const transporter = createTransporter();
  const senderEmail = process.env.GMAIL_USER || 'web.premraj@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #e5e5e5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #141414; border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 16px; padding: 32px; overflow: hidden; }
          .header { text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 20px; }
          .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
          h1 { color: #ffffff; font-size: 22px; margin: 10px 0; }
          p { color: #a3a3a3; font-size: 14px; line-height: 1.6; }
          .highlight-box { background: rgba(249, 115, 22, 0.08); border-left: 4px solid #f97316; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          .details-table td { padding: 8px 0; color: #d4d4d4; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .details-table td.label { font-weight: 600; color: #f97316; width: 120px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #737373; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">● Automated Confirmation</div>
            <h1>Thank You for Connecting!</h1>
          </div>

          <p>Hi <strong>${name || 'there'}</strong>,</p>

          <p>Thank you for reaching out through my portfolio platform. This is an automated message to confirm that your inquiry has been safely received.</p>

          <div class="highlight-box">
            <strong style="color: #ffffff;">We will message you shortly!</strong>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #d4d4d4;">Prem Raj will review your project requirements and follow up directly at this email address.</p>
          </div>

          <h3 style="color: #ffffff; font-size: 15px; margin-top: 24px;">Submission Details Summary:</h3>
          <table class="details-table">
            <tr>
              <td class="label">Project Domain:</td>
              <td>${projectType}</td>
            </tr>
            <tr>
              <td class="label">Your Email:</td>
              <td>${email}</td>
            </tr>
            <tr>
              <td class="label">Message Snippet:</td>
              <td>${message}</td>
            </tr>
          </table>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Prem Raj — Full Stack & AI Systems Engineer</p>
            <p>Direct Email: <a href="mailto:${senderEmail}" style="color: #f97316;">${senderEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const adminHtmlContent = `
    <div style="font-family: sans-serif; background: #111; color: #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #f97316;">New Inquiry Received!</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Domain:</strong> ${projectType}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #222; padding: 12px; border-left: 3px solid #f97316;">${message}</blockquote>
    </div>
  `;

  if (!transporter) {
    console.log('[SIMULATED EMAIL DISPATCH] Thank You Email to:', email);
    console.log('[SIMULATED EMAIL DISPATCH] Admin Alert to:', senderEmail);
    return { success: true, simulated: true };
  }

  // Dispatch email to user
  await transporter.sendMail({
    from: `"Prem Raj Portfolio" <${senderEmail}>`,
    to: email,
    subject: `Thank you for reaching out, ${name || 'Friend'}! — Prem Raj`,
    html: htmlContent,
  });

  // Dispatch alert to admin
  await transporter.sendMail({
    from: `"Portfolio Alert" <${senderEmail}>`,
    to: senderEmail,
    subject: `🔔 New Portfolio Contact Inquiry: ${name} (${projectType})`,
    html: adminHtmlContent,
  });

  return { success: true, simulated: false };
}
