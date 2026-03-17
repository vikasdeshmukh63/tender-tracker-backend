import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { appConfig } from "../config/config.js";

const toUserDto = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  profile: user.profile && {
    id: user.profile.id,
    email: user.profile.email,
    full_name: user.profile.full_name,
    employee_number: user.profile.employee_number,
    designation: user.profile.designation,
    team: user.profile.team,
    role: user.profile.role,
  },
});

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, employeeNumber, designation, role, team, password } = req.body;

    if (!email || !password || !fullName || !employeeNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await models.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await models.User.create(
      {
        email,
        passwordHash,
        role: role || "user",
        profile: {
          email,
          full_name: fullName,
          employee_number: employeeNumber,
          designation: designation || "",
          role: role || "user",
          team,
        },
      },
      { include: [{ model: models.UserProfile, as: "profile" }] }
    );

    const token = jwt.sign({ userId: user.id }, appConfig.jwtSecret, {
      expiresIn: appConfig.jwtExpiresIn,
    });

    res.status(201).json({ token, user: toUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await models.User.findOne({
      where: { email },
      include: [{ model: models.UserProfile, as: "profile" }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, appConfig.jwtSecret, {
      expiresIn: appConfig.jwtExpiresIn,
    });

    res.json({ token, user: toUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ user: toUserDto(req.user) });
};

