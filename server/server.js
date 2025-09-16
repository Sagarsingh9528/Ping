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

await connectDB();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());


app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


app.use("/api/inngest", serve({ client: inngest, functions }));


app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ success: false, message: "Server error" });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
