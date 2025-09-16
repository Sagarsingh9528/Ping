import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postroutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();

// ✅ Connect to MongoDB before starting server
await connectDB();

// ✅ CORS configuration
const allowedOrigins = [
  "https://ping-vshc.vercel.app",     // your production frontend
  "http://localhost:5173",            // local dev (vite)
];

// optional: allow all Vercel preview URLs of this project
const vercelPreviewRegex = /^https:\/\/ping-vshc-[a-z0-9]+\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like curl or server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        vercelPreviewRegex.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ handles form-data text fields
app.use(clerkMiddleware()); // Clerk auth

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ Inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

// ✅ API routes
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ success: false, message: "Server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
