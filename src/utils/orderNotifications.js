import nodemailer from "nodemailer";
import twilio from "twilio";

const buildMessage = (order) => {
  return [
    `Order Confirmed: ${order.orderId}`,
    `Book: ${order.productName}`,
    `Qty: ${order.quantity}`,
    `Total: Rs ${order.totalPrice}`,
    `Advance Paid: Rs ${order.advancePaidAmount}`,
    `COD Remaining: Rs ${order.codAmount}`,
    `Txn Ref: ${order.transactionReference}`,
    "Status: Confirmed (Half payment received)"
  ].join("\n");
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

export const sendOrderNotifications = async ({ order, email, phone }) => {
  const text = buildMessage(order);
  const result = {
    emailSent: false,
    smsSent: false,
    warnings: []
  };

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM || smtpUser;

  if (smtpHost && smtpUser && smtpPass && email) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: `Order Confirmation - ${order.orderId}`,
        text
      });
      result.emailSent = true;
    } catch (error) {
      result.warnings.push(`Email failed: ${error.message}`);
    }
  } else {
    result.warnings.push("Email config missing or customer email unavailable");
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  const toPhone = normalizePhone(phone);

  if (twilioSid && twilioToken && twilioFrom && toPhone) {
    try {
      const client = twilio(twilioSid, twilioToken);
      await client.messages.create({
        from: twilioFrom,
        to: toPhone,
        body: text
      });
      result.smsSent = true;
    } catch (error) {
      result.warnings.push(`SMS failed: ${error.message}`);
    }
  } else {
    result.warnings.push("SMS config missing or customer phone unavailable");
  }

  return result;
};
