import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password, role: "user" });
  const token = generateToken(user);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "");

  let user = await User.findOne({ email: normalizedEmail });

  // Keep admin account stable even if DB password/role drifts.
  if (normalizedEmail === adminEmail && password === adminPassword) {
    if (!user) {
      user = await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: normalizedEmail,
        password: adminPassword,
        role: "admin"
      });
    } else {
      let changed = false;
      if (user.role !== "admin") {
        user.role = "admin";
        changed = true;
      }

      const samePassword = await user.comparePassword(adminPassword);
      if (!samePassword) {
        user.password = adminPassword;
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }
  }

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  if (user.role !== "admin" || user.email !== adminEmail) {
    res.status(403);
    throw new Error("This account does not have admin access");
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});
