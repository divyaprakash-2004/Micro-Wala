import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook
} from "../controllers/bookController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { requireCloudinary, upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", protect, adminOnly, requireCloudinary, upload.single("image"), createBook);
router.put("/:id", protect, adminOnly, requireCloudinary, upload.single("image"), updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

export default router;
