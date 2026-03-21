import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { connectDB } from "../config/db.js";
import Book from "../models/Book.js";
import { isCloudinaryEnabled, uploadLocalFileToCloudinary } from "../utils/cloudinary.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const resolveLegacyFilePath = (imageValue) => {
  const clean = String(imageValue || "").trim().replace(/^\//, "");
  const basename = path.basename(clean);

  const candidates = [
    path.resolve(__dirname, "..", "uploads", basename),
    path.resolve(process.cwd(), "src", "uploads", basename)
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
};

const run = async () => {
  if (!isCloudinaryEnabled()) {
    throw new Error("Cloudinary env variables are missing. Set CLOUDINARY_* first.");
  }

  await connectDB();

  const books = await Book.find();
  let migrated = 0;
  let skipped = 0;

  for (const book of books) {
    if (isAbsoluteUrl(book.image)) {
      continue;
    }

    const localFilePath = resolveLegacyFilePath(book.image);
    if (localFilePath) {
      try {
        const uploaded = await uploadLocalFileToCloudinary(localFilePath);
        book.image = uploaded.secure_url;
        await book.save();
        migrated += 1;
        console.log(`[MIGRATE] Uploaded: ${book.title}`);
        continue;
      } catch (error) {
        console.error(`[MIGRATE] Upload failed for ${book.title}: ${error.message}`);
      }
    }

    if (process.env.DEFAULT_BOOK_IMAGE_URL) {
      book.image = process.env.DEFAULT_BOOK_IMAGE_URL;
      await book.save();
      migrated += 1;
      console.log(`[MIGRATE] Fallback assigned: ${book.title}`);
    } else {
      skipped += 1;
      console.warn(`[MIGRATE] Skipped (missing local file + DEFAULT_BOOK_IMAGE_URL): ${book.title}`);
    }
  }

  console.log(`[MIGRATE] Completed. Migrated: ${migrated}, Skipped: ${skipped}`);
  process.exit(0);
};

run().catch((error) => {
  console.error("[MIGRATE] Failed:", error.message);
  process.exit(1);
});