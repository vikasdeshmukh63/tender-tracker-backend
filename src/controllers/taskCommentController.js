import models from "../models/index.js";

export const listComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comments = await models.TaskComment.findAll({
      where: { taskId },
      order: [["created_at", "ASC"]],
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const comment = await models.TaskComment.create({
      taskId,
      content,
      author_email: req.user?.email || null,
      author_name: req.user?.profile?.full_name || null,
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

