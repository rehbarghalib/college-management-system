import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('📧 Testing email...');
  console.log(`📧 User: ${process.env.EMAIL_USER}`);
  console.log(`📧 Password length: ${process.env.EMAIL_PASS?.length || 0} characters`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Email connection successful!');

    const info = await transporter.sendMail({
      from: `"Quantum Group" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Test Email',
      html: `<h1>Email Working!</h1><p>Your forgot password feature is ready.</p>`
    });

    console.log('✅ Test email sent!');
    console.log(`📨 Check your inbox: ${process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. EMAIL_PASS is the 16-char App Password (not regular password)');
    console.log('2. 2-Step Verification is enabled on your Google Account');
    console.log('3. App Password was generated for "Mail" app');
  }
};

testEmail();