import models from "../models/index.js";

export const listNotificationRules = async (req, res, next) => {
  try {
    const { user_email } = req.query;
    const where = {};
    if (user_email) where.user_email = user_email;
    const rules = await models.NotificationRule.findAll({ where });
    res.json(rules);
  } catch (err) {
    next(err);
  }
};

export const createNotificationRule = async (req, res, next) => {
  try {
    const rule = await models.NotificationRule.create(req.body);
    res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
};

export const updateNotificationRule = async (req, res, next) => {
  try {
    const rule = await models.NotificationRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    await rule.update(req.body);
    res.json(rule);
  } catch (err) {
    next(err);
  }
};

export const deleteNotificationRule = async (req, res, next) => {
  try {
    const rule = await models.NotificationRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    await rule.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

