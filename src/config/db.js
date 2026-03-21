import dns from "dns";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error(
        "Mongo URI is missing. Set MONGO_URI (or MONGODB_URI / DATABASE_URL)."
      );
    }

    if (mongoUri.startsWith("mongodb+srv://") && process.env.DNS_SERVERS) {
      const dnsServers = process.env.DNS_SERVERS
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

      if (dnsServers.length > 0) {
        dns.setServers(dnsServers);
      }
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
