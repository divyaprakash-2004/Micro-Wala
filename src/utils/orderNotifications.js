import nodemailer from "nodemailer";
import twilio from "twilio";
import NotificationLog from "../models/NotificationLog.js";
import { getNotificationConfigStatus } from "./envValidation.js";
import { orderStatusLabel } from "./orderStatus.js";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const estimateDeliveryText = (orderedAt) => {
  const sourceDate = orderedAt ? new Date(orderedAt) : new Date();
  if (Number.isNaN(sourceDate.getTime())) {
    return "3-5 business days";
  }

  const estimate = new Date(sourceDate);
  estimate.setDate(estimate.getDate() + 5);
  return estimate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    const countryCode = String(process.env.SMS_DEFAULT_COUNTRY_CODE || "+91").trim();
    return `${countryCode}${digits}`;
  }

  if (digits.startsWith("0") && digits.length > 10) {
    return `+${digits.slice(1)}`;
  }

  return digits.startsWith("+") ? digits : `+${digits}`;
};

const getMailTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const persistFailedNotification = async ({ order, eventType, channel, recipient, status, attempts, errorMessage, payload }) => {
  try {
    await NotificationLog.create({
      orderId: order?.orderId,
      eventType,
      channel,
      recipient,
      status,
      attempts,
      errorMessage,
      payload
    });
  } catch (error) {
    console.error("[NOTIFY][LOG] Failed to persist notification log:", error.message);
  }
};

const withRetries = async ({ work, maxAttempts, onRetry }) => {
  let attempts = 0;
  let lastError = null;

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      await work(attempts);
      return { success: true, attempts };
    } catch (error) {
      lastError = error;
      if (attempts < maxAttempts) {
        await onRetry?.(attempts, error);
        const delayMs = Number(process.env.NOTIFY_RETRY_DELAY_MS || 700);
        await sleep(delayMs);
      }
    }
  }

  return {
    success: false,
    attempts,
    error: lastError
  };
};

export const sendSMS = async (phone, message) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  const toPhone = normalizePhone(phone);

  if (!twilioSid || !twilioToken || !twilioFrom) {
    throw new Error("SMS configuration is missing");
  }

  if (!toPhone) {
    throw new Error("Customer phone number is missing");
  }

  console.log(`[NOTIFY][SMS] Sending SMS to ${toPhone}`);
  const client = twilio(twilioSid, twilioToken);
  await client.messages.create({
    from: twilioFrom,
    to: toPhone,
    body: message
  });
  console.log(`[NOTIFY][SMS] SMS sent to ${toPhone}`);
};

export const sendEmail = async (to, subject, htmlContent) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error("Email configuration is missing");
  }

  if (!to) {
    throw new Error("Customer email is missing");
  }

  console.log(`[NOTIFY][EMAIL] Sending email to ${to} | Subject: ${subject}`);
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    html: htmlContent
  });
  console.log(`[NOTIFY][EMAIL] Email sent to ${to}`);
};

const buildOrderPlacedSms = (order) =>
  `Your order has been placed successfully. Order ID: ${order.orderId}. Thank you for shopping with us!`;

const buildStatusUpdateSms = (order) => {
  const label = orderStatusLabel(order.status);
  if (label === "Confirmed") {
    return `Your order ${order.orderId} has been confirmed.`;
  }
  if (label === "Shipped") {
    return `Your order ${order.orderId} has been shipped.`;
  }
  if (label === "Out for Delivery") {
    return `Your order ${order.orderId} is out for delivery.`;
  }
  if (label === "Delivered") {
    return `Your order ${order.orderId} has been delivered.`;
  }
  return `Your order ${order.orderId} status is now ${label}.`;
};

const buildItemsHtml = (order) => `<li>${order.productName} x ${order.quantity} - ${formatCurrency(order.totalPrice)}</li>`;

const buildOrderPlacedEmail = (order) => {
  const estimatedDelivery = estimateDeliveryText(order.createdAt);
  const statusText = orderStatusLabel(order.status);
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h2 style="margin-bottom:8px;">Order Confirmation</h2>
      <p>Your order has been placed successfully.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Ordered items:</strong></p>
      <ul>${buildItemsHtml(order)}</ul>
      <p><strong>Total price:</strong> ${formatCurrency(order.totalPrice)}</p>
      <p><strong>Delivery address:</strong> ${order.address}, ${order.pincode}</p>
      <p><strong>Estimated delivery time:</strong> ${estimatedDelivery}</p>
      <p><strong>Current order status:</strong> ${statusText}</p>
    </div>
  `;
};

const buildStatusUpdateEmail = (order) => {
  const statusText = orderStatusLabel(order.status);
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h2 style="margin-bottom:8px;">Order Status Updated</h2>
      <p>Your order status has been updated.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Current status:</strong> ${statusText}</p>
      <p><strong>Ordered items:</strong></p>
      <ul>${buildItemsHtml(order)}</ul>
      <p><strong>Total price:</strong> ${formatCurrency(order.totalPrice)}</p>
      <p><strong>Delivery address:</strong> ${order.address}, ${order.pincode}</p>
    </div>
  `;
};

const getBaseNotificationResult = () => {
  const config = getNotificationConfigStatus();

  return {
    emailConfigured: config.emailConfigured,
    smsConfigured: config.smsConfigured,
    emailSent: false,
    smsSent: false,
    email: {
      status: config.emailConfigured ? "Pending" : "Not Configured",
      attempts: 0,
      errorMessage: ""
    },
    sms: {
      status: config.smsConfigured ? "Pending" : "Not Configured",
      attempts: 0,
      errorMessage: ""
    },
    warnings: []
  };
};

const notifyChannel = async ({ order, eventType, channel, recipient, sender, payload }) => {
  const maxAttempts = Math.max(1, Number(process.env.NOTIFY_RETRY_ATTEMPTS || 3));

  const run = await withRetries({
    maxAttempts,
    work: async () => {
      await sender();
    },
    onRetry: async (attempt, error) => {
      const errorMessage = error?.message || "Unknown error";
      console.error(`[NOTIFY][${channel}] Attempt ${attempt} failed: ${errorMessage}`);
      await persistFailedNotification({
        order,
        eventType,
        channel,
        recipient,
        status: "Retrying",
        attempts: attempt,
        errorMessage,
        payload
      });
    }
  });

  if (!run.success) {
    const errorMessage = run.error?.message || "Unknown error";
    console.error(`[NOTIFY][${channel}] Failed after ${run.attempts} attempts: ${errorMessage}`);
    await persistFailedNotification({
      order,
      eventType,
      channel,
      recipient,
      status: "Failed",
      attempts: run.attempts,
      errorMessage,
      payload
    });
  }

  return run;
};

const safeNotify = async ({ order, eventType, phone, smsMessage, email, emailSubject, emailHtml }) => {
  const result = getBaseNotificationResult();

  if (result.smsConfigured) {
    const smsRun = await notifyChannel({
      order,
      eventType,
      channel: "SMS",
      recipient: String(phone || "unknown"),
      payload: { message: smsMessage },
      sender: () => sendSMS(phone, smsMessage)
    });

    result.smsSent = smsRun.success;
    result.sms.status = smsRun.success ? "Sent" : "Failed";
    result.sms.attempts = smsRun.attempts;
    result.sms.errorMessage = smsRun.error?.message || "";
    if (!smsRun.success) {
      result.warnings.push(`SMS failed: ${result.sms.errorMessage}`);
    }
  }

  if (result.emailConfigured) {
    const emailRun = await notifyChannel({
      order,
      eventType,
      channel: "EMAIL",
      recipient: String(email || "unknown"),
      payload: { subject: emailSubject },
      sender: () => sendEmail(email, emailSubject, emailHtml)
    });

    result.emailSent = emailRun.success;
    result.email.status = emailRun.success ? "Sent" : "Failed";
    result.email.attempts = emailRun.attempts;
    result.email.errorMessage = emailRun.error?.message || "";
    if (!emailRun.success) {
      result.warnings.push(`Email failed: ${result.email.errorMessage}`);
    }
  }

  return result;
};

export const sendOrderPlacedNotifications = async ({ order, email, phone }) => {
  return safeNotify({
    order,
    eventType: "ORDER_PLACED",
    phone,
    smsMessage: buildOrderPlacedSms(order),
    email,
    emailSubject: `Order Confirmation - ${order.orderId}`,
    emailHtml: buildOrderPlacedEmail(order)
  });
};

export const sendOrderStatusNotifications = async ({ order, email, phone }) => {
  return safeNotify({
    order,
    eventType: "ORDER_STATUS_UPDATED",
    phone,
    smsMessage: buildStatusUpdateSms(order),
    email,
    emailSubject: `Order Status Updated - ${order.orderId}`,
    emailHtml: buildStatusUpdateEmail(order)
  });
};
