import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time
export const getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// Send OTP via email
export const sendOTPEmail = async (email, otp, name = 'Admin') => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing in .env file');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const currentYear = new Date().getFullYear();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    const formattedExpiry = expiryTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Quantum Group" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Password Reset OTP - ${process.env.COLLEGE_NAME || 'Quantum Group'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fc; padding: 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
            .header { background: linear-gradient(135deg, #1e40af, #2563eb); padding: 30px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
            .header p { color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px; }
            .body { padding: 30px 25px; }
            .body h2 { color: #1e293b; font-size: 20px; margin-top: 0; }
            .body p { color: #475569; line-height: 1.6; font-size: 15px; }
            .otp-box { text-align: center; margin: 30px 0; padding: 25px; background-color: #f0f7ff; border-radius: 12px; border: 2px dashed #2563eb; }
            .otp-box .otp-code { font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1e40af; font-family: 'Courier New', monospace; }
            .otp-box .otp-label { display: block; font-size: 12px; color: #64748b; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
            .info-item { background: #f8fafc; padding: 12px; border-radius: 8px; text-align: center; }
            .info-item .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
            .info-item .value { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px; }
            .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 15px; margin: 20px 0; border-radius: 4px; }
            .warning p { color: #991b1b; font-size: 13px; margin: 0; }
            .footer { text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; }
            .footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
              <p>${process.env.COLLEGE_NAME || 'The Quantum Group'} - Admin Panel</p>
            </div>
            <div class="body">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your admin account.</p>
              <p>Use the following One-Time Password (OTP) to reset your password:</p>
              <div class="otp-box">
                <span class="otp-code">${otp}</span>
                <span class="otp-label">One-Time Password</span>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="label">⏰ Expires At</div>
                  <div class="value">${formattedExpiry}</div>
                </div>
                <div class="info-item">
                  <div class="label">⏱️ Valid For</div>
                  <div class="value">10 Minutes</div>
                </div>
              </div>
              <div class="warning">
                <p>⚠️ If you didn't request this, please ignore this email.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${currentYear} ${process.env.COLLEGE_NAME || 'The Quantum Group'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return false;
  }
};