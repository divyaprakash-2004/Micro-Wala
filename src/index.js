import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { validateStartupEnv } from "./utils/envValidation.js";
import { ensureAdmin } from "./utils/seedAdmin.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: (origin, callback) => {
      const envOrigins = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

      const allowedOrigins = [
        process.env.CLIENT_URL,
        ...envOrigins,
        "http://localhost:5173",
        "http://localhost:5174"
      ].filter(Boolean);

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.loca\.lt$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.netlify\.app$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Book Store API is running",
    health: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  const envCheck = validateStartupEnv();
  const readyState = mongoose.connection.readyState;
  const dbStatus = readyState === 1 ? "connected" : "disconnected";

  res.status(envCheck.ok ? 200 : 503).json({
    message: "API is running",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    env: {
      startupOk: envCheck.ok,
      requiredMissing: envCheck.requiredMissing,
      optional: envCheck.optional
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    const envCheck = validateStartupEnv();
    if (!envCheck.ok) {
      console.error("Missing required environment variables:", envCheck.requiredMissing.join(", "));
      process.exit(1);
    }

    if (!envCheck.optional.smtpReady || !envCheck.optional.twilioReady) {
      console.warn("Notification providers are partially configured. SMS/Email delivery may fail.");
    }

    await connectDB();
    await ensureAdmin();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error?.message || error);
    process.exit(1);
  }
};

start();
