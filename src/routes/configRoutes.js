import express from "express";
import { getConfigStatus } from "../controllers/configController.js";

const router = express.Router();

router.get("/status", getConfigStatus);

export default router;