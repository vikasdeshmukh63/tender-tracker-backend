import models from "../models/index.js";

const normalizeSubmissionDate = (payload) => {
  if (!payload) return payload;
  const copy = { ...payload };
  if (copy.submission_date) {
    const d = new Date(copy.submission_date);
    if (Number.isNaN(d.getTime())) {
      // Drop invalid submission_date so DB doesn't receive "Invalid date"
      delete copy.submission_date;
    }
  }
  return copy;
};

export const listTenders = async (req, res, next) => {
  try {
    const { team, status, submission_date } = req.query;
    const where = {};
    if (team) where.team = team;
    if (status) where.status = status;
    if (submission_date) where.submission_date = submission_date;

    const tenders = await models.Tender.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    res.json(tenders);
  } catch (err) {
    next(err);
  }
};

export const getTender = async (req, res, next) => {
  try {
    const tender = await models.Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: "Tender not found" });
    res.json(tender);
  } catch (err) {
    next(err);
  }
};

export const createTender = async (req, res, next) => {
  try {
    const payload = normalizeSubmissionDate(req.body);
    const tender = await models.Tender.create(payload);
    res.status(201).json(tender);
  } catch (err) {
    next(err);
  }
};

export const updateTender = async (req, res, next) => {
  try {
    const tender = await models.Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: "Tender not found" });
    const payload = normalizeSubmissionDate(req.body);
    await tender.update(payload);
    res.json(tender);
  } catch (err) {
    next(err);
  }
};

export const deleteTender = async (req, res, next) => {
  try {
    const tender = await models.Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: "Tender not found" });
    await tender.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

