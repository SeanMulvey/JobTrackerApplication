const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  // For production, use environment variables for email configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the message
 * @param {string} options.html - HTML version of the message (optional)
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
    };
    
    // Add HTML if provided
    if (options.html) {
      mailOptions.html = options.html;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
}; 