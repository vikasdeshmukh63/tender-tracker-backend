import nodemailer from "nodemailer";
import { emailConfig } from "../config/config.js";

let transporter = null;

if (emailConfig.host && emailConfig.user && emailConfig.pass) {
  transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
} else {
  console.log("[emailService] SMTP config incomplete; email disabled", {
    host: emailConfig.host,
    user: emailConfig.user,
    hasPass: Boolean(emailConfig.pass),
  });
}

export const sendEmail = async ({ to, subject, body, fromName = "Tender Tracker" }) => {
  if (!transporter) {
    console.log("[emailService] Email disabled. Would send:", { to, subject });
    return;
  }

  console.log("[emailService] Attempting to send email", { to, subject });

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${emailConfig.user}>`,
      to,
      subject,
      html: body,
    });
    console.log("[emailService] Email sent successfully", { to, subject });
  } catch (err) {
    console.error("[emailService] Failed to send email", { to, subject, error: err.message });
    throw err;
  }
};

