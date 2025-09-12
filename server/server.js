import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express"; 
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";

const app = express();

// ✅ Connect to MongoDB before starting server
await connectDB();

// ✅ Core middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ handles form-data text fields
app.use(clerkMiddleware()); // Clerk auth

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ Inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

// ✅ User routes
app.use("/api/user", userRouter);

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Global error handler (optional, good for multer/clerk errors)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ success: false, message: "Server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
