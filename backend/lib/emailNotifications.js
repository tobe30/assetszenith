import User from "../models/User.js";
import sendEmail from "../config/nodemailer.js";

const escapeHtml = (value) => String(value ?? "—")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const emailBody = ({ heading, message, details = [] }) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#20262a;line-height:1.6">
    <h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(heading)}</h1>
    <p>${escapeHtml(message)}</p>
    ${details.length ? `<table style="width:100%;border-collapse:collapse;margin:20px 0">${details.map(([label, value]) => `<tr><td style="padding:8px 12px;border:1px solid #e5e9e7;color:#687179">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e5e9e7;font-weight:600">${escapeHtml(value)}</td></tr>`).join("")}</table>` : ""}
    <p style="font-size:12px;color:#687179;margin-top:24px">Assets Zenith account notification</p>
  </div>`;

const sendNotification = async ({ to, subject, heading, message, details }) => {
  if (!to) return;
  try {
    await sendEmail({ to, subject, body: emailBody({ heading, message, details }), senderName: "Assets Zenith" });
  } catch (error) {
    // Email delivery must not undo a completed wallet or transaction update.
    console.error(`Could not send account notification to ${to}:`, error);
  }
};

export const emailUserNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId).select("email").lean();
    if (!user?.email) return;
    await sendNotification({ ...notification, to: user.email });
  } catch (error) {
    console.error("Could not prepare user email notification:", error);
  }
};

export const emailAdminNotification = async (notification) => {
  try {
    const admins = await User.find({ role: "admin", status: "active" }).select("email").lean();
    await Promise.all(admins.map((admin) => sendNotification({ ...notification, to: admin.email })));
  } catch (error) {
    console.error("Could not prepare admin email notifications:", error);
  }
};
