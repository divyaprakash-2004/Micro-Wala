import asyncHandler from "express-async-handler";
import NotificationLog from "../models/NotificationLog.js";
import User from "../models/User.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

export const getFailedNotificationLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const logs = await NotificationLog.find()
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(logs);
});
