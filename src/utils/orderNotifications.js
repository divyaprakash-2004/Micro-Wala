import nodemailer from "nodemailer";
import twilio from "twilio";
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

  const client = twilio(twilioSid, twilioToken);
  await client.messages.create({
    from: twilioFrom,
    to: toPhone,
    body: message
  });
};

export const sendEmail = async (to, subject, htmlContent) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error("Email configuration is missing");
  }

  if (!to) {
    throw new Error("Customer email is missing");
  }

  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    html: htmlContent
  });
};

const buildOrderPlacedSms = (order) =>
  `Your order has been placed successfully. Order ID: ${order.orderId}. Thank you for shopping with us!`;

const buildStatusUpdateSms = (order) => {
  const label = orderStatusLabel(order.status);
  if (label === "Confirmed") {
    return `Your order ${order.orderId} has been confirmed.`;
  }
  if (label === "Out for Delivery") {
    return `Your order ${order.orderId} is out for delivery.`;
  }
  if (label === "Delivered") {
    return `Your order ${order.orderId} has been delivered.`;
  }
  return `Your order ${order.orderId} status is now ${label}.`;
};

const buildItemsHtml = (order) => {
  return `<li>${order.productName} x ${order.quantity} - ${formatCurrency(order.totalPrice)}</li>`;
};

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
      <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;" />
      <p style="margin:0;">Thank you for shopping with us.</p>
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
      <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;" />
      <p style="margin:0;">We will keep you informed until delivery is completed.</p>
    </div>
  `;
};

const createNotificationResult = () => ({
  emailSent: false,
  smsSent: false,
  warnings: []
});

const safeNotify = async ({ phone, smsMessage, email, emailSubject, emailHtml }) => {
  const result = createNotificationResult();

  try {
    await sendSMS(phone, smsMessage);
    result.smsSent = true;
  } catch (error) {
    result.warnings.push(`SMS failed: ${error.message}`);
  }

  try {
    await sendEmail(email, emailSubject, emailHtml);
    result.emailSent = true;
  } catch (error) {
    result.warnings.push(`Email failed: ${error.message}`);
  }

  return result;
};

export const sendOrderPlacedNotifications = async ({ order, email, phone }) => {
  return safeNotify({
    phone,
    smsMessage: buildOrderPlacedSms(order),
    email,
    emailSubject: `Order Confirmation - ${order.orderId}`,
    emailHtml: buildOrderPlacedEmail(order)
  });
};

export const sendOrderStatusNotifications = async ({ order, email, phone }) => {
  return safeNotify({
    phone,
    smsMessage: buildStatusUpdateSms(order),
    email,
    emailSubject: `Order Status Updated - ${order.orderId}`,
    emailHtml: buildStatusUpdateEmail(order)
  });
};
