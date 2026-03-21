import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productImage: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ["HALF_QR_COD"],
      required: true
    },
    transactionReference: {
      type: String,
      required: true,
      trim: true
    },
    advancePaidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    codAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial_paid", "paid"],
      default: "pending"
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
