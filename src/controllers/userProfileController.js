import models from "../models/index.js";

export const searchProfiles = async (req, res, next) => {
  try {
    const { email, team } = req.query;
    const where = {};
    if (email) where.email = email;
    if (team) where.team = team;
    const profiles = await models.UserProfile.findAll({ where });
    res.json(profiles);
  } catch (err) {
    next(err);
  }
};

