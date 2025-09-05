import express from 'express';
import { clerkAuth } from '../middleware/clerkauth.js';
import {
  editProfile,
  getCurrentUser,
  getAllNotifications,
  follow,
  followingList,
  suggestedUsers,
  search,
  markAsRead,
  getProfile
} from '../controllers/userController.js';
import { upload } from '../configs/multer.js';
import User from "../models/userModel.js"; // MongoDB User model
import { users } from "@clerk/clerk-sdk-node"; // Clerk SDK

const userRouter = express.Router();

// -------------------- GET CURRENT USER --------------------
userRouter.get("/me", clerkAuth, async (req, res) => {
  try {
    const { userId } = await req.auth(); // Clerk ID

    // Try fetch user by clerkId first
    let user = await User.findOne({ clerkId: userId }).select("-password");

    if (!user) {
      // Extra safety: check by email if clerkId not found
      const clerkUser = await users.getUser(userId);
      user = await User.findOne({ email: clerkUser.emailAddresses?.[0]?.emailAddress }).select("-password");

      if (!user) {
        // If still not found, create new user
        user = await User.create({
          clerkId: clerkUser.id,
          full_name: clerkUser.fullName || "Unnamed User",
          email: clerkUser.emailAddresses?.[0]?.emailAddress || `noemail-${Date.now()}@example.com`,
          profileImage: clerkUser.imageUrl || ""
        });
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


// -------------------- OTHER ROUTES --------------------
userRouter.get('/current', clerkAuth, getCurrentUser);
userRouter.get('/suggested', clerkAuth, suggestedUsers);
userRouter.get('/getProfile/:username', clerkAuth, getProfile);
userRouter.get("/follow/:targetUserId", clerkAuth, follow);
userRouter.get("/followingList", clerkAuth, followingList);
userRouter.get("/search", clerkAuth, search);
userRouter.get("/getAllNotifications", clerkAuth, getAllNotifications);
userRouter.post("/markAsRead", clerkAuth, markAsRead);
userRouter.post("/editProfile", clerkAuth, upload.single("profile_picture"), editProfile);

export default userRouter;
