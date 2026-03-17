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
}

export const sendEmail = async ({ to, subject, body, fromName = "Tender Tracker" }) => {
  if (!transporter) {
    console.log("[emailService] Email disabled. Would send:", { to, subject });
    return;
  }

  await transporter.sendMail({
    from: `"${fromName}" <${emailConfig.user}>`,
    to,
    subject,
    html: body,
  });
};

