/**
 * emailService.js
 * Sends transactional emails via Brevo (Sendinblue) SMTP using Nodemailer.
 */
const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_FROM_EMAIL,   // Your Brevo account email
      pass: process.env.BREVO_SMTP_KEY,     // SMTP API key
    },
  });

// ── Send password reset email ─────────────────────────────────────────────
const sendPasswordResetEmail = async ({ toEmail, toName, resetUrl }) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6f9; margin:0; padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
              style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:32px; text-align:center;">
                  <h1 style="color:#fff; margin:0; font-size:26px; letter-spacing:-0.5px;">🎓 EqualEd</h1>
                  <p style="color:rgba(255,255,255,0.8); margin:6px 0 0; font-size:14px;">Inclusive Learning for Everyone</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <h2 style="color:#1e1b4b; margin:0 0 12px; font-size:22px;">Reset your password</h2>
                  <p style="color:#4b5563; line-height:1.7; margin:0 0 24px;">
                    Hi ${toName || 'there'},<br/>
                    We received a request to reset your password. Click the button below to create a new one.
                    This link expires in <strong>1 hour</strong>.
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align:center; margin:28px 0;">
                    <a href="${resetUrl}"
                      style="display:inline-block; background:linear-gradient(135deg,#4f46e5,#7c3aed);
                      color:#fff; text-decoration:none; font-weight:700; font-size:16px;
                      padding:14px 36px; border-radius:50px; letter-spacing:0.3px;">
                      Reset Password
                    </a>
                  </div>

                  <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0;">
                    If you didn't request this, you can safely ignore this email.
                    Your password will not be changed.
                  </p>

                  <!-- Token fallback -->
                  <div style="background:#f9fafb; border-radius:10px; padding:14px 18px; margin-top:24px; border:1px solid #e5e7eb;">
                    <p style="color:#6b7280; font-size:12px; margin:0 0 6px;">Or copy this link into your browser:</p>
                    <p style="color:#4f46e5; font-size:12px; word-break:break-all; margin:0;">${resetUrl}</p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb; padding:20px 40px; border-top:1px solid #e5e7eb; text-align:center;">
                  <p style="color:#9ca3af; font-size:12px; margin:0;">
                    © ${new Date().getFullYear()} EqualEd · Inclusive Education Platform<br/>
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${process.env.BREVO_FROM_NAME || 'EqualEd'}" <${process.env.BREVO_FROM_EMAIL}>`,
    to: toEmail,
    subject: '🔑 Reset your EqualEd password',
    html,
  });
};

// ── Send welcome email (for future use) ──────────────────────────────────
const sendWelcomeEmail = async ({ toEmail, toName }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.BREVO_FROM_NAME || 'EqualEd'}" <${process.env.BREVO_FROM_EMAIL}>`,
    to: toEmail,
    subject: '🎉 Welcome to EqualEd!',
    html: `<p>Hi ${toName}, welcome to EqualEd! Start learning today.</p>`,
  });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
