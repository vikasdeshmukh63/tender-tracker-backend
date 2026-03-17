import models from "../models/index.js";

export const searchProfiles = async (req, res, next) => {
  try {
    const { email } = req.query;
    const where = {};
    if (email) where.email = email;
    const profiles = await models.UserProfile.findAll({ where });
    res.json(profiles);
  } catch (err) {
    next(err);
  }
};

