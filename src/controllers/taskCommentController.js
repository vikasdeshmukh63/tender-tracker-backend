import multer from "multer";
import models from "../models/index.js";
import { uploadBufferToMinio, deleteFromMinio } from "../services/fileService.js";

// Use memory storage so we can stream the buffer straight to MinIO
export const upload = multer({ storage: multer.memoryStorage() });

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
    const content = req.body.content?.trim() || "";

    if (!content && !req.file) {
      return res
        .status(400)
        .json({ message: "Comment text or attachment is required" });
    }

    let file_url = null;
    let file_name = null;
    let file_object_name = null;

    if (req.file) {
      const timestamp = Date.now();
      const safeName = req.file.originalname.replace(/\s+/g, "_");
      file_object_name = `task-comments/${timestamp}-${safeName}`;
      file_name = req.file.originalname;
      file_url = await uploadBufferToMinio(
        file_object_name,
        req.file.buffer,
        req.file.mimetype
      );
    }

    const comment = await models.TaskComment.create({
      taskId,
      content,
      file_url,
      file_name,
      file_object_name,
      author_email: req.user?.email || null,
      author_name:
        req.user?.profile?.full_name || req.user?.email || null,
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await models.TaskComment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only the author (or an admin) may delete a comment
    if (
      comment.author_email !== req.user?.email &&
      req.user?.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    // Delete attachment from MinIO if one exists
    if (comment.file_object_name) {
      try {
        await deleteFromMinio(comment.file_object_name);
      } catch (minioErr) {
        // Log but do not block the DB deletion
        console.error(
          "[taskCommentController] MinIO delete failed:",
          minioErr.message
        );
      }
    }

    await comment.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
