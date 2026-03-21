import asyncHandler from "express-async-handler";
import Book from "../models/Book.js";

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
  res.json(books);
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }
  res.json(book);
});

export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, price, stock, description } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Book image is required");
  }

  const image = `/uploads/${req.file.filename}`;

  const book = await Book.create({
    title,
    author,
    category: category || "General",
    price,
    stock,
    description,
    image
  });

  res.status(201).json(book);
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
    book.image = `/uploads/${req.file.filename}`;
  }

  const updated = await book.save();
  res.json(updated);
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
