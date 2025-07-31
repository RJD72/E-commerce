const nodeMailer = require("nodemailer");

/**
 * Send email with optional attachments
 * @param {string|Array} to - Recipient email(s)
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 * @param {Array} [attachments] - Optional array of attachments
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Your Store <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments, // Add attachments to mail options
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
