import jwt from "jsonwebtoken";
import { appConfig } from "../config/config.js";
import models from "../models/index.js";

export const authRequired = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, appConfig.jwtSecret);
    const user = await models.User.findByPk(payload.userId, {
      include: [{ model: models.UserProfile, as: "profile" }],
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

