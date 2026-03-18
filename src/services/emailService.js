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

/**
 * Send a task-assignment notification email to one or more assignees.
 *
 * @param {object} options
 * @param {string|string[]} options.to          - Recipient email(s)
 * @param {string}          options.taskTitle   - Title of the task
 * @param {string}          options.description - Task description (may be empty)
 * @param {string}          options.priority    - Task priority level
 * @param {string}          options.due_date    - Due date string (may be empty)
 * @param {string}          options.assignedBy  - Full name or email of the team lead
 * @param {boolean}         options.isUpdate    - true = update email, false = new assignment
 */
export const sendTaskAssignmentEmail = async ({
  to,
  taskTitle,
  description,
  priority,
  due_date,
  assignedBy,
  isUpdate = false,
}) => {
  const recipients = Array.isArray(to) ? to : [to];
  const validRecipients = recipients.filter(Boolean);
  if (validRecipients.length === 0) return;

  const actionLabel = isUpdate ? "updated" : "assigned to you";
  const subject = isUpdate
    ? `Task Updated: ${taskTitle}`
    : `New Task Assigned: ${taskTitle}`;

  const dueDateRow = due_date
    ? `<tr><td style="padding:4px 8px;color:#6b7280;font-size:13px;">Due Date</td><td style="padding:4px 8px;font-size:13px;">${due_date}</td></tr>`
    : "";

  const body = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111827;">
      <div style="background:#1e3a8a;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="color:#fff;margin:0;font-size:18px;">Task ${isUpdate ? "Updated" : "Assigned"}</h2>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <p style="margin:0 0 16px;font-size:14px;">
          A task has been <strong>${actionLabel}</strong> by <strong>${assignedBy}</strong>.
        </p>
        <table style="border-collapse:collapse;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:6px;">
          <tr style="background:#eff6ff;">
            <td colspan="2" style="padding:8px 12px;font-weight:700;font-size:14px;">${taskTitle}</td>
          </tr>
          ${description ? `<tr><td style="padding:4px 8px;color:#6b7280;font-size:13px;vertical-align:top;">Description</td><td style="padding:4px 8px;font-size:13px;">${description}</td></tr>` : ""}
          <tr><td style="padding:4px 8px;color:#6b7280;font-size:13px;">Priority</td><td style="padding:4px 8px;font-size:13px;text-transform:capitalize;">${priority || "—"}</td></tr>
          ${dueDateRow}
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">This is an automated notification from Tender Tracker.</p>
      </div>
    </div>
  `;

  for (const recipient of validRecipients) {
    await sendEmail({ to: recipient, subject, body });
  }
};

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

