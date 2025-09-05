import express from "express";
import { clerkAuth } from "../middleware/clerkauth.js";

import { sendMessage, getAllMessages, getPrevUserChats } from "../controllers/messageController.js"; // ✅ yaha add karo

const messageRouter = express.Router();

messageRouter.post("/send/:receiverId", clerkAuth, sendMessage);
messageRouter.get("/getAll/:receiverId", clerkAuth, getAllMessages); // ✅ ab error nahi aayega
messageRouter.get("/previous", clerkAuth, getPrevUserChats);

export default messageRouter;
