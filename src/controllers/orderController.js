import asyncHandler from "express-async-handler";
import QRCode from "qrcode";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { sendOrderPlacedNotifications, sendOrderStatusNotifications } from "../utils/orderNotifications.js";
import { ORDER_STATUS, ORDER_STATUS_VALUES, canMoveToNextOrderStatus, normalizeOrderStatus } from "../utils/orderStatus.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { name, phone, address, pincode, productId, quantity, paymentMethod, transactionReference } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error("Please login to place an order");
  }

  if (!name || !phone || !address || !pincode || !productId || !quantity || !paymentMethod || !transactionReference) {
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
  const normalizedTxnRef = String(transactionReference || "").trim();

  if (normalizedMethod !== "HALF_QR_COD") {
    res.status(400);
    throw new Error("Only half payment + COD is allowed");
  }

  if (normalizedTxnRef.length < 4) {
    res.status(400);
    throw new Error("Transaction reference is required to confirm half payment");
  }

  const advancePaidAmount = Number((totalPrice / 2).toFixed(2));
  const codAmount = Number((totalPrice - advancePaidAmount).toFixed(2));
  const paymentStatus = "partial_paid";

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
    transactionReference: normalizedTxnRef,
    advancePaidAmount,
    codAmount,
    paymentStatus
  });

  const notifications = await sendOrderPlacedNotifications({
    order,
    email: req.user.email
  });

  res.status(201).json({
    message: "Order confirmed after half payment",
    order,
    notifications
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
  const nextStatus = normalizeOrderStatus(status);

  if (!ORDER_STATUS_VALUES.includes(nextStatus)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const previousStatus = normalizeOrderStatus(order.status);

  if (!canMoveToNextOrderStatus(previousStatus, nextStatus)) {
    res.status(400);
    throw new Error("Invalid status flow. Allowed: Pending -> Confirmed -> Shipped -> Out for Delivery -> Delivered");
  }

  order.status = nextStatus;
  if (order.paymentMethod === "HALF_QR_COD" && nextStatus === ORDER_STATUS.DELIVERED) {
    order.paymentStatus = "paid";
  }

  const updated = await order.save();

  let customerEmail = "";
  if (updated.user) {
    const user = await User.findById(updated.user).select("email");
    customerEmail = user?.email || "";
  }

  let notifications = null;
  const shouldNotifyStatusChange =
    previousStatus !== nextStatus &&
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.SHIPPED, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(nextStatus);

  if (shouldNotifyStatusChange) {
    notifications = await sendOrderStatusNotifications({
      order: updated,
      email: customerEmail
    });
  }

  res.json({
    order: updated,
    notifications
  });
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
