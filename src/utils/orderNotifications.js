import nodemailer from "nodemailer";
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

const withRetries = async ({ work, maxAttempts }) => {
  let attempts = 0;
  let lastError = null;

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      await work();
      return { success: true, attempts };
    } catch (error) {
      lastError = error;
      const errorMessage = error?.message || "Unknown error";
      console.error(`[NOTIFY][EMAIL] Attempt ${attempts} failed: ${errorMessage}`);
      if (attempts < maxAttempts) {
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

const safeNotifyEmail = async ({ email, emailSubject, emailHtml }) => {
  const config = getNotificationConfigStatus();
  const result = {
    emailConfigured: config.emailConfigured,
    emailSent: false,
    email: {
      status: config.emailConfigured ? "Pending" : "Not Configured",
      attempts: 0,
      errorMessage: ""
    },
    warnings: []
  };

  if (!config.emailConfigured) {
    return result;
  }

  const run = await withRetries({
    maxAttempts: Math.max(1, Number(process.env.NOTIFY_RETRY_ATTEMPTS || 3)),
    work: async () => sendEmail(email, emailSubject, emailHtml)
  });

  result.emailSent = run.success;
  result.email.status = run.success ? "Sent" : "Failed";
  result.email.attempts = run.attempts;
  result.email.errorMessage = run.error?.message || "";
  if (!run.success) {
    result.warnings.push(`Email failed: ${result.email.errorMessage}`);
  }

  return result;
};

export const sendOrderPlacedNotifications = async ({ order, email }) => {
  return safeNotifyEmail({
    email,
    emailSubject: `Order Confirmation - ${order.orderId}`,
    emailHtml: buildOrderPlacedEmail(order)
  });
};

export const sendOrderStatusNotifications = async ({ order, email }) => {
  return safeNotifyEmail({
    email,
    emailSubject: `Order Status Updated - ${order.orderId}`,
    emailHtml: buildStatusUpdateEmail(order)
  });
};
