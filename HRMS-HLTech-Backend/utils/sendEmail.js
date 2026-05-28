const nodemailer = require('nodemailer');

// Log SMTP configuration for debugging
console.log('SMTP Configuration:', {
  host: process.env.SMTP_HOST || 'Not set',
  port: process.env.SMTP_PORT || 'Not set',
  user: process.env.SMTP_USER || 'Not set',
  pass: process.env.SMTP_PASS ? '[REDACTED]' : 'Not set',
  emailFrom: process.env.EMAIL_FROM || 'Not set',
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    // Validate environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
      console.error('SMTP configuration missing:', {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS ? '[REDACTED]' : 'Not set',
        EMAIL_FROM: process.env.EMAIL_FROM,
      });
      throw new Error('Missing SMTP configuration. Please check environment variables.');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // Use SSL for port 465, TLS for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Optional: for testing purposes, can be removed in production
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;