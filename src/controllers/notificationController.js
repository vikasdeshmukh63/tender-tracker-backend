import models from "../models/index.js";
import { Op } from "sequelize";

export const listNotifications = async (req, res, next) => {
  try {
    const { user_email, limit = 50 } = req.query;
    const where = {};
    if (user_email) where.user_email = user_email;
    const notifications = await models.Notification.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a notification.
 * If `dedup_key` is provided, uses findOrCreate so the same alert is never duplicated.
 */
export const createNotification = async (req, res, next) => {
  try {
    const { dedup_key, ...rest } = req.body;

    if (dedup_key) {
      const [notification, created] = await models.Notification.findOrCreate({
        where: { dedup_key },
        defaults: { ...rest, dedup_key },
      });
      return res.status(created ? 201 : 200).json(notification);
    }

    const notification = await models.Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const notification = await models.Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    await notification.update(req.body);
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all unread notifications as read for a given user_email.
 * PUT /notifications/mark-all-read  { user_email }
 */
export const markAllRead = async (req, res, next) => {
  try {
    const { user_email } = req.body;
    if (!user_email) return res.status(400).json({ message: "user_email is required" });

    await models.Notification.update(
      { is_read: true },
      { where: { user_email, is_read: false } }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
