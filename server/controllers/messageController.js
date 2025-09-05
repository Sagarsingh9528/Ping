import uploadOnCloudinary from "../configs/cloudinary.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Conversation from "../models/conversationalModal.js"; // ✅ Capitalize model

// -------------------- SEND MESSAGE --------------------
export const sendMessage = async (req, res) => {
  try {
    const { userId: senderId } = await req.auth(); // ✅ Clerk se userId
    const receiverId = req.params.receiverId;
    const { message } = req.body;

    let media;
    if (req.file) {
      media = await uploadOnCloudinary(req.file.path);
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
      media,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    return res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: `send Message error: ${error}` });
  }
};

// -------------------- GET ALL MESSAGES --------------------
export const getAllMessages = async (req, res) => {
  try {
    const { userId: senderId } = await req.auth(); // ✅ Fix
    const receiverId = req.params.receiverId;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    return res.status(200).json(conversation?.messages || []);
  } catch (error) {
    return res.status(500).json({ message: `get Message error: ${error}` });
  }
};

// -------------------- GET PREVIOUS USER CHATS --------------------
export const getPrevUserChats = async (req, res) => {
  try {
    const { userId: currentUserId } = await req.auth(); // ✅ Fix

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants")
      .sort({ updatedAt: -1 });

    const userMap = {};

    conversations.forEach((conv) => {
      conv.participants.forEach((user) => {
        if (user._id.toString() !== currentUserId.toString()) {
          userMap[user._id] = user;
        }
      });
    });

    const previousUsers = Object.values(userMap);
    return res.status(200).json(previousUsers);
  } catch (error) {
    return res.status(500).json({ message: `prev user error: ${error}` });
  }
};
