import models from "../models/index.js";

export const listTenders = async (req, res, next) => {
  try {
    const { team, status, month, year } = req.query;
    const where = {};
    if (team) where.team = team;
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;

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
    const tender = await models.Tender.create(req.body);
    res.status(201).json(tender);
  } catch (err) {
    next(err);
  }
};

export const updateTender = async (req, res, next) => {
  try {
    const tender = await models.Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: "Tender not found" });
    await tender.update(req.body);
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

