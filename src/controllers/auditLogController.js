import models from "../models/index.js";

export const listAuditLogs = async (req, res, next) => {
  try {
    const { tender_id } = req.query;
    const where = {};
    if (tender_id) where.tenderId = tender_id;

    const logs = await models.AuditLog.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const createAuditLog = async (req, res, next) => {
  try {
    const log = await models.AuditLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

