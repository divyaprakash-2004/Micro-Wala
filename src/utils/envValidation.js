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

  const optional = getOptionalConfigStatus();

  return {
    ok: requiredMissing.length === 0,
    requiredMissing,
    optional
  };
};

export const getOptionalConfigStatus = () => ({
  smtpReady: hasValue(process.env.SMTP_HOST) && hasValue(process.env.SMTP_USER) && hasValue(process.env.SMTP_PASS),
  cloudinaryReady:
    hasValue(process.env.CLOUDINARY_CLOUD_NAME) &&
    hasValue(process.env.CLOUDINARY_API_KEY) &&
    hasValue(process.env.CLOUDINARY_API_SECRET)
});

export const getNotificationConfigStatus = () => {
  const optional = getOptionalConfigStatus();
  return {
    emailConfigured: optional.smtpReady
  };
};