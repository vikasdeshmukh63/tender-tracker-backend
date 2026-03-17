import models from "../models/index.js";

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

export const createNotification = async (req, res, next) => {
  try {
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

