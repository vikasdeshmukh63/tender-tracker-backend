import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { appConfig } from "../config/config.js";
import { sendEmail } from "../services/emailService.js";

const toUserDto = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
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

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpNotification = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Your Tender Tracker OTP Code",
    body: `
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for activating your Tender Tracker account is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code is valid for 10 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, employeeNumber, designation, role, team, password } = req.body;

    if (!email || !password || !fullName || !employeeNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure this email is not already registered for this specific team
    const existingProfileSameTeam = await models.UserProfile.findOne({
      where: { email, team },
    });
    if (existingProfileSameTeam) {
      // If the underlying user exists but is not activated, resend OTP instead of blocking
      const existingUser = await models.User.findOne({ where: { email } });
      if (existingUser && !existingUser.isActive) {
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await existingUser.update({ otpCode: otp, otpExpiresAt: expiresAt, isActive: false });
        await sendOtpNotification(email, otp);

        return res.status(200).json({
          message:
            "You are already registered but your account is not activated. A new OTP has been sent to your email.",
          user: toUserDto(existingUser),
          otpPending: true,
        });
      }

      return res.status(400).json({ message: "User is already registered for this team" });
    }

    // Ensure employee number is unique within a team
    const existingProfile = await models.UserProfile.findOne({
      where: { employee_number: employeeNumber, team },
    });
    if (existingProfile) {
      return res.status(400).json({ message: "Employee number is already registered for this team" });
    }

    // Reuse existing user record if email already exists; otherwise create a new user
    let user = await models.User.findOne({ where: { email } });

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await models.User.create(
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
    } else {
      // Existing user with same email; create an additional profile for this team
      await models.UserProfile.create({
        userId: user.id,
        email,
        full_name: fullName,
        employee_number: employeeNumber,
        designation: designation || "",
        role: role || "user",
        team,
      });
    }
    // Generate and store OTP for account activation
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.update({ otpCode: otp, otpExpiresAt: expiresAt, isActive: false });
    await sendOtpNotification(email, otp);

    res
      .status(201)
      .json({
        message: "Signup successful. Please verify the OTP sent to your email to activate your account.",
        user: toUserDto(user),
      });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, team } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await models.User.findOne({
      where: { email },
      include: [
        {
          model: models.UserProfile,
          as: "profile",
          where: team ? { team } : undefined,
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If a team is specified on login, ensure the user is registered for that team first
    if (team && !user.profile) {
      return res
        .status(403)
        .json({ message: `User is not registered for the ${team} team` });
    }

    // Only require OTP if the account is not activated AND the user is registered for this team
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is not activated. Please verify the OTP sent to your email.",
        requireOtp: true,
        email,
      });
    }

    const token = jwt.sign({ userId: user.id }, appConfig.jwtSecret, {
      expiresIn: appConfig.jwtExpiresIn,
    });

    res.json({ token, user: toUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No OTP pending for this user" });
    }

    const now = new Date();
    if (now > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please sign up again to receive a new OTP." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await user.update({ isActive: true, otpCode: null, otpExpiresAt: null });

    const token = jwt.sign({ userId: user.id }, appConfig.jwtSecret, {
      expiresIn: appConfig.jwtExpiresIn,
    });

    res.json({ message: "Account activated successfully", token, user: toUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "Account is already activated" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.update({ otpCode: otp, otpExpiresAt: expiresAt, isActive: false });
    await sendOtpNotification(email, otp);

    res.json({
      message: "A new OTP has been sent to your email.",
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ user: toUserDto(req.user) });
};

