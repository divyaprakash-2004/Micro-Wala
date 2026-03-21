import express from "express";
import { adminLogin, getMe, loginUser, registerUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", adminLogin);
router.get("/me", protect, getMe);

export default router;
