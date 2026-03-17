import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import models from "../models/index.js";
import { getUploadPath, getPublicUrlForFile } from "../services/fileService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath(""));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

export const upload = multer({ storage });

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

    const fileUrl = getPublicUrlForFile(path.basename(req.file.path));
    const attachment = await models.TenderAttachment.create({
      tenderId,
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
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
    await attachment.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

