import fs from "fs";
import multer from "multer";
import path from "path";
import { isCloudinaryEnabled } from "../utils/cloudinary.js";

const uploadDir = path.join(process.cwd(), "src", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-").toLowerCase();
    cb(null, `${baseName}-${Date.now()}${ext}`);
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image uploads are allowed"), false);
  }
};

export const upload = multer({
  storage: isCloudinaryEnabled() ? memoryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
