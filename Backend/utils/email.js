const nodemailer = require('nodemailer');

/**
 * Email utility with automatic fallback to console logging
 * when SMTP is not configured.
 * 
 * To enable real email sending, set these in your .env:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 *   SMTP_FROM=SkyComic <noreply@skycomic.com>
 */

const isSmtpConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const createTransporter = () => {
  if (!isSmtpConfigured()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email. Falls back to console.log if SMTP is not configured.
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    // Development fallback: log to console
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL (Console Mode - No SMTP configured)');
    console.log('='.repeat(60));
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:`);
    // Strip HTML tags for console readability
    const textContent = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    console.log(`  ${textContent}`);
    console.log('='.repeat(60) + '\n');
    return { messageId: 'console-dev-mode', accepted: [to] };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `SkyComic <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  return info;
};

/**
 * Send a password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Full URL to reset password page
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'SkyComic - Đặt lại mật khẩu';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
      <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 32px 40px;">
        <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700;">SkyComic</h1>
      </div>
      <div style="padding: 40px;">
        <h2 style="color: #fafafa; font-size: 20px; margin: 0 0 12px 0;">Đặt lại mật khẩu</h2>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
          Nhấn vào nút bên dưới để tạo mật khẩu mới. Link này sẽ hết hạn sau <strong style="color: #fafafa;">15 phút</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #e11d48; color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          Đặt lại mật khẩu
        </a>
        <p style="color: #71717a; font-size: 12px; margin: 24px 0 0 0; line-height: 1.6;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
        </p>
        <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
        <p style="color: #52525b; font-size: 11px; margin: 0;">
          Link reset: <a href="${resetUrl}" style="color: #52525b; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

module.exports = { sendEmail, sendPasswordResetEmail };
