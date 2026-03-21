import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      trim: true
    },
    eventType: {
      type: String,
      enum: ["ORDER_PLACED", "ORDER_STATUS_UPDATED"],
      required: true
    },
    channel: {
      type: String,
      enum: ["SMS", "EMAIL"],
      required: true
    },
    recipient: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1
    },
    errorMessage: {
      type: String,
      trim: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

const NotificationLog = mongoose.model("NotificationLog", notificationLogSchema);

export default NotificationLog;