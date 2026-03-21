import asyncHandler from "express-async-handler";
import Book from "../models/Book.js";
import { isCloudinaryEnabled } from "../utils/cloudinary.js";

const FALLBACK_BOOK_IMAGE_URL =
  process.env.DEFAULT_BOOK_IMAGE_URL ||
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

const normalizeBookImage = (bookDoc) => {
  const plain = typeof bookDoc?.toObject === "function" ? bookDoc.toObject() : bookDoc;
  const image = String(plain?.image || "").trim();
  const isAbsolute = /^https?:\/\//i.test(image);

  return {
    ...plain,
    image: isAbsolute ? image : FALLBACK_BOOK_IMAGE_URL
  };
};

const resolveImagePath = async (file) => {
  if (!file) {
    return "";
  }

  if (!isCloudinaryEnabled()) {
    throw new Error("Cloudinary is not configured");
  }

  return file.path || file.secure_url || "";
};

export const getBooks = asyncHandler(async (req, res) => {
  const { search = "", author = "", category = "", minPrice, maxPrice } = req.query;

  const query = {
    title: { $regex: search, $options: "i" },
    author: { $regex: author, $options: "i" }
  };

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  const books = await Book.find(query).sort({ createdAt: -1 });
  res.json(books.map(normalizeBookImage));
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }
  res.json(normalizeBookImage(book));
});

export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, price, stock, description } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Book image is required");
  }

  const image = await resolveImagePath(req.file);

  const book = await Book.create({
    title,
    author,
    category: category || "General",
    price,
    stock,
    description,
    image
  });

  res.status(201).json(normalizeBookImage(book));
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const { title, author, category, price, stock, description } = req.body;

  book.title = title ?? book.title;
  book.author = author ?? book.author;
  book.category = category ?? book.category;
  book.price = price ?? book.price;
  book.stock = stock ?? book.stock;
  book.description = description ?? book.description;

  if (req.file) {
    book.image = await resolveImagePath(req.file);
  }

  const updated = await book.save();
  res.json(normalizeBookImage(updated));
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  await book.deleteOne();
  res.json({ message: "Book deleted" });
});
