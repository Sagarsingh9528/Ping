import express from "express";
import { clerkAuth } from "../middleware/clerkauth.js";

import { sendMessage, getAllMessages, getPrevUserChats } from "../controllers/messageController.js"; 
const messageRouter = express.Router();

messageRouter.post("/send/:receiverId", clerkAuth, sendMessage);
messageRouter.get("/getAll/:receiverId", clerkAuth, getAllMessages); 
messageRouter.get("/previous", clerkAuth, getPrevUserChats);

export default messageRouter;
