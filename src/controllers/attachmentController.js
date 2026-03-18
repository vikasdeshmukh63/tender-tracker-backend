import multer from "multer";
import models from "../models/index.js";
import { uploadBufferToMinio, deleteFromMinio } from "../services/fileService.js";

// Memory storage — buffer is streamed straight to MinIO; nothing lands on local disk
export const upload = multer({ storage: multer.memoryStorage() });

export const listAttachments = async (req, res, next) => {
  try {
    const { tenderId } = req.params;
    const attachments = await models.TenderAttachment.findAll({
      where: { tenderId },
      order: [["created_at", "DESC"]],
    });
    res.json(attachments);
  } catch (err) {
    next(err);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    const { tenderId } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/\s+/g, "_");
    const objectName = `tender-attachments/${tenderId}/${timestamp}-${safeName}`;

    const fileUrl = await uploadBufferToMinio(
      objectName,
      req.file.buffer,
      req.file.mimetype
    );

    const attachment = await models.TenderAttachment.create({
      tenderId,
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      document_type: req.body.document_type || "other",
      file_object_name: objectName,
      uploaded_by: req.user?.email || null,
    });

    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attachment = await models.TenderAttachment.findByPk(id);
    if (!attachment) return res.status(404).json({ message: "Attachment not found" });

    // Delete the file from MinIO first
    if (attachment.file_object_name) {
      try {
        await deleteFromMinio(attachment.file_object_name);
      } catch (minioErr) {
        console.error("[attachmentController] MinIO delete failed:", minioErr.message);
      }
    }

    await attachment.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
