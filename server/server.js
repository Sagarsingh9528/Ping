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

// ✅ connect to database
await connectDB();

// ✅ allowed origins
// const allowedOrigins = [
//   "https://ping-vshc.vercel.app",    // your production frontend
//   "http://localhost:5173",           // local dev
// ];

// ✅ allow any Vercel preview deployment like
// https://ping-vshc-<anything>.vercel.app
const vercelPreviewRegex = /^https:\/\/ping-vshc-[^.]+\.vercel\.app$/;

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // allow non-browser tools (like curl) with no Origin header
//       if (!origin) return callback(null, true);

//       if (
//         allowedOrigins.includes(origin) ||
//         vercelPreviewRegex.test(origin)
//       ) {
//         return callback(null, true);
//       }

//       return callback(new Error("Not allowed by CORS"), false);
//     },
//     credentials: true,
//   })
// );
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// ✅ test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// ✅ API routes
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ success: false, message: "Server error" });
});

// ✅ start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
