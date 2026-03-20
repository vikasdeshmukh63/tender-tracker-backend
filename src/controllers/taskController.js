import models from "../models/index.js";
import { Op } from "sequelize";
import { sendTaskAssignmentEmail } from "../services/emailService.js";

/**
 * Collect the full list of assignee emails from a task payload or Task instance.
 * Merges the `assignees` JSONB array with the legacy `assigned_to` string field.
 */
function collectAssigneeEmails(taskOrPayload) {
  const emails = new Set();
  if (Array.isArray(taskOrPayload.assignees)) {
    taskOrPayload.assignees.forEach((email) => email && emails.add(email));
  }
  if (taskOrPayload.assigned_to) {
    emails.add(taskOrPayload.assigned_to);
  }
  return [...emails];
}

/**
 * Create an in-app notification for each assignee.
 * Fire-and-forget — errors are logged but never bubble up to the caller.
 */
async function notifyAssignees(task, assignedBy, isUpdate) {
  try {
    const emails = collectAssigneeEmails(task);
    if (!emails.length) return;

    const verb = isUpdate ? "updated" : "assigned to you";
    const dedupSuffix = isUpdate ? `upd_${Date.now()}` : "new";

    await Promise.all(
      emails.map((email) =>
        models.Notification.create({
          user_email: email,
          type: "task_assigned",
          message: isUpdate
            ? `Task updated by ${assignedBy}: "${task.title}"`
            : `New task assigned by ${assignedBy}: "${task.title}"`,
          dedup_key: `task_${task.id}_${dedupSuffix}_${email}`,
          tender_id: task.tenderId,
          is_read: false,
        }).catch((err) =>
          console.warn("[taskController] Failed to create in-app notification:", err.message)
        )
      )
    );
  } catch (err) {
    console.warn("[taskController] notifyAssignees error:", err.message);
  }
}

export const listTasks = async (req, res, next) => {
  try {
    const { tender_id, limit } = req.query;
    const where = {};
    if (tender_id) where.tenderId = tender_id;

    // Team leads/admins see all matching tasks, users only see tasks assigned to them
    if (req.user.role !== "team_lead" && req.user.role !== "admin") {
      const email = req.user.email;
      where[Op.or] = [
        { assigned_to: email },
        // assignees is a JSONB array of emails
        { assignees: { [Op.contains]: [email] } },
      ];
    }

    const tasks = await models.Task.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: limit ? Number(limit) : undefined,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    // Only team leads and admins can create tasks
    if (req.user.role !== "team_lead" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only team leads can create tasks" });
    }

    const { tender_id, tenderId, ...rest } = req.body;
    const payload = {
      ...rest,
      tenderId: tenderId ?? tender_id,
    };
    const task = await models.Task.create(payload);
    res.status(201).json(task);

    const assignedBy = req.user.fullName || req.user.email;

    // Fire-and-forget: in-app notifications
    notifyAssignees(task, assignedBy, false);

    // Fire-and-forget: email notifications
    const assigneeEmails = collectAssigneeEmails(task);
    if (assigneeEmails.length > 0) {
      sendTaskAssignmentEmail({
        to: assigneeEmails,
        taskTitle: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        assignedBy,
        isUpdate: false,
      }).catch((err) =>
        console.error("[taskController] Failed to send task creation email:", err.message)
      );
    }
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await models.Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const assignedBy = req.user.fullName || req.user.email;

    // Team leads/admins can update full task; users can only change status on their own tasks
    if (req.user.role === "team_lead" || req.user.role === "admin") {
      await task.update(req.body);

      // Fire-and-forget: in-app + email notifications
      notifyAssignees(task, assignedBy, true);

      const assigneeEmails = collectAssigneeEmails(task);
      if (assigneeEmails.length > 0) {
        sendTaskAssignmentEmail({
          to: assigneeEmails,
          taskTitle: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          assignedBy,
          isUpdate: true,
        }).catch((err) =>
          console.error("[taskController] Failed to send task update email:", err.message)
        );
      }
    } else {
      const email = req.user.email;
      const isAssignee =
        task.assigned_to === email ||
        (Array.isArray(task.assignees) && task.assignees.includes(email));
      if (!isAssignee) {
        return res.status(403).json({ message: "You can only update your own tasks" });
      }
      const partial = {};
      if (typeof req.body.status === "string") {
        partial.status = req.body.status;
      }
      if (Object.keys(partial).length === 0) {
        return res.status(400).json({ message: "Nothing to update" });
      }
      await task.update(partial);
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await models.Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (req.user.role !== "team_lead" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only team leads can delete tasks" });
    }
    await task.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
