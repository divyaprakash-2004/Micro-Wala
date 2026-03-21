import express from "express";
import { getAllUsers, getFailedNotificationLogs } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/failed-notifications", protect, adminOnly, getFailedNotificationLogs);

export default router;
