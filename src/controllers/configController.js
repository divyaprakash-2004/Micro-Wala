import asyncHandler from "express-async-handler";
import { getNotificationConfigStatus } from "../utils/envValidation.js";

export const getConfigStatus = asyncHandler(async (req, res) => {
  const status = getNotificationConfigStatus();
  res.json(status);
});