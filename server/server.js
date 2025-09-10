import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";   // ✅ FIX: import serve

const app = express();

// ✅ Connect to MongoDB before server starts
await connectDB();

// ✅ Middlewares
app.use(express.json());

app.use(cors());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ✅ Inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

// ✅ Port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);