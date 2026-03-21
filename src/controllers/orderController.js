import asyncHandler from "express-async-handler";
import QRCode from "qrcode";
import Book from "../models/Book.js";
import Order from "../models/Order.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { name, phone, address, pincode, productId, quantity, paymentMethod } = req.body;

  if (!name || !phone || !address || !pincode || !productId || !quantity || !paymentMethod) {
    res.status(400);
    throw new Error("Please fill all required checkout fields");
  }

  const parsedQuantity = Number(quantity);
  if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const book = await Book.findById(productId);
  if (!book) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (book.stock < parsedQuantity) {
    res.status(400);
    throw new Error("Insufficient stock for this book");
  }

  const totalPrice = Number((book.price * parsedQuantity).toFixed(2));
  const normalizedMethod = String(paymentMethod || "").toUpperCase();
  const allowedMethods = ["QR", "COD", "HALF_QR_COD"];

  if (!allowedMethods.includes(normalizedMethod)) {
    res.status(400);
    throw new Error("Invalid payment method");
  }

  let advancePaidAmount = 0;
  let codAmount = 0;
  let paymentStatus = "pending";

  if (normalizedMethod === "QR") {
    advancePaidAmount = totalPrice;
    codAmount = 0;
    paymentStatus = "pending";
  } else if (normalizedMethod === "HALF_QR_COD") {
    advancePaidAmount = Number((totalPrice / 2).toFixed(2));
    codAmount = Number((totalPrice - advancePaidAmount).toFixed(2));
    paymentStatus = "partial_paid";
  } else {
    advancePaidAmount = 0;
    codAmount = totalPrice;
    paymentStatus = "pending";
  }

  await Book.findByIdAndUpdate(book._id, { $inc: { stock: -parsedQuantity } });

  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const order = await Order.create({
    orderId,
    user: req.user?._id,
    name,
    phone,
    address,
    pincode,
    productId: book._id,
    productName: book.title,
    productImage: book.image,
    quantity: parsedQuantity,
    totalPrice,
    paymentMethod: normalizedMethod,
    advancePaidAmount,
    codAmount,
    paymentStatus
  });

  const whatsappText = encodeURIComponent(
    `Order Placed: ${order.orderId}\nName: ${name}\nBook: ${book.title}\nQty: ${parsedQuantity}\nTotal: Rs ${totalPrice}\nPayment: ${normalizedMethod}\nAdvance Paid: Rs ${advancePaidAmount}\nCOD Remaining: Rs ${codAmount}`
  );

  res.status(201).json({
    message: "Order placed successfully",
    order,
    whatsappLink: `https://wa.me/?text=${whatsappText}`
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("productId", "title price image")
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const nextStatus = String(status || "").toLowerCase();
  const allowed = ["pending", "shipped", "delivered"];

  if (!allowed.includes(nextStatus)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = nextStatus;
  if (order.paymentMethod === "QR" && nextStatus !== "pending") {
    order.paymentStatus = "paid";
  }
  if (order.paymentMethod === "HALF_QR_COD" && nextStatus === "delivered") {
    order.paymentStatus = "paid";
  }

  const updated = await order.save();
  res.json(updated);
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();
  res.json({ message: "Order deleted" });
});

export const getPaymentQr = asyncHandler(async (req, res) => {
  const amount = Number(req.query.amount || 0);

  if (!amount || Number.isNaN(amount)) {
    res.status(400);
    throw new Error("Valid amount is required for QR");
  }

  const payload = `BOOK-STORE-PAYMENT|AMOUNT:${amount.toFixed(2)}|UPI:bookstore@upi`;
  const qrCodeDataUrl = await QRCode.toDataURL(payload);
  res.json({ qrCodeDataUrl, payload });
});
