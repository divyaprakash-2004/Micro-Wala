import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary, isCloudinaryEnabled } from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const extension = file.mimetype.split("/")[1] || "jpg";
    return {
      folder: "micro-book-store",
      resource_type: "image",
      format: extension,
      public_id: `book-${Date.now()}-${Math.round(Math.random() * 1e6)}`
    };
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image uploads are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const requireCloudinary = (req, res, next) => {
  if (!isCloudinaryEnabled()) {
    res.status(503);
    next(new Error("Cloudinary is not configured. Image upload is unavailable."));
    return;
  }
  next();
};
