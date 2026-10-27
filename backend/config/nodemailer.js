import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, body, senderName }) => {
  const from = senderName
    ? `"${senderName}" <${process.env.SENDER_EMAIL}>`
    : process.env.SENDER_EMAIL;

  const response = await transporter.sendMail({
    from,
    to,
    subject,
    html: body,
  });

  return response;
};

export default sendEmail;
