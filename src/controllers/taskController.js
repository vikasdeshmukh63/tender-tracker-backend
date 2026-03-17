import models from "../models/index.js";

export const listTasks = async (req, res, next) => {
  try {
    const { tender_id, limit } = req.query;
    const where = {};
    if (tender_id) where.tenderId = tender_id;

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
    const task = await models.Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await models.Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.update(req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await models.Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

