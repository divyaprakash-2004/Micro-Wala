const hasValue = (value) => String(value || "").trim().length > 0;

const hasMongoUri = () => hasValue(process.env.MONGO_URI) || hasValue(process.env.MONGODB_URI) || hasValue(process.env.DATABASE_URL);

export const validateStartupEnv = () => {
  const requiredMissing = [];
  if (!hasMongoUri()) {
    requiredMissing.push("MONGO_URI (or MONGODB_URI / DATABASE_URL)");
  }
  if (!hasValue(process.env.JWT_SECRET)) {
    requiredMissing.push("JWT_SECRET");
  }

  const optional = {
    smtpReady: hasValue(process.env.SMTP_HOST) && hasValue(process.env.SMTP_USER) && hasValue(process.env.SMTP_PASS),
    twilioReady:
      hasValue(process.env.TWILIO_ACCOUNT_SID) &&
      hasValue(process.env.TWILIO_AUTH_TOKEN) &&
      hasValue(process.env.TWILIO_PHONE_NUMBER),
    cloudinaryReady:
      hasValue(process.env.CLOUDINARY_CLOUD_NAME) &&
      hasValue(process.env.CLOUDINARY_API_KEY) &&
      hasValue(process.env.CLOUDINARY_API_SECRET)
  };

  return {
    ok: requiredMissing.length === 0,
    requiredMissing,
    optional
  };
};