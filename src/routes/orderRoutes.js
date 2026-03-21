import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getPaymentQr,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/qr", getPaymentQr);
router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
