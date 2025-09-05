import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import uploadOnCloudinary from "../configs/cloudinary.js";

// -------------------- GET CURRENT USER --------------------
export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Clerk user ID
    const user = await User.findOne({ clerkId: userId }).populate(
      "posts loops posts.author posts.comments story following"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- SUGGESTED USERS --------------------
export const suggestedUsers = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Clerk
    const users = await User.find({
      clerkId: { $ne: userId },
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- EDIT PROFILE --------------------
export const editProfile = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Clerk
    const { full_name, username, bio, location, cover_photo } = req.body;

    const user = await User.findOne({ clerkId: userId }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check username uniqueness
    if (username && username !== user.username) {
      const sameUserWithUserName = await User.findOne({ username }).select("-password");
      if (sameUserWithUserName) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Upload profile picture if exists
    if (req.file) {
      const profileImage = await uploadOnCloudinary(req.file.path);
      user.profileImage = profileImage;
    }

    // Update fields
    user.full_name = full_name || user.full_name;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.cover_photo = cover_photo || user.cover_photo;

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Edit profile error: ${error.message}` });
  }
};

// -------------------- GET PROFILE --------------------
export const getProfile = async (req, res) => {
  try {
    const userName = req.params.username;
    const user = await User.findOne({ username: userName })
      .select("-password")
      .populate("posts loops following followers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Get profile error: ${error.message}` });
  }
};

// -------------------- FOLLOW / UNFOLLOW --------------------
export const follow = async (req, res) => {
  try {
    const { userId: currentUserId } = await req.auth(); // ✅ Clerk
    const targetUserId = req.params.targetUserId;

    if (!targetUserId) return res.status(400).json({ message: "Target user not found" });
    if (currentUserId === targetUserId) return res.status(400).json({ message: "You cannot follow yourself" });

    const currentUser = await User.findOne({ clerkId: currentUserId });
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) return res.status(404).json({ message: "User not found" });

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({ following: false, message: "Unfollowed successfully" });
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      // Optional notification logic
      const notification = await Notification.create({
        sender: currentUser._id,
        receiver: targetUser._id,
        type: "follow",
        message: "started following you",
      });

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({ following: true, message: "Followed successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: `Follow error: ${error.message}` });
  }
};

// -------------------- FOLLOWING LIST --------------------
export const followingList = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Clerk
    const user = await User.findOne({ clerkId: userId });
    return res.status(200).json(user?.following || []);
  } catch (error) {
    return res.status(500).json({ message: `Following error: ${error.message}` });
  }
};

// -------------------- SEARCH USER --------------------
export const search = async (req, res) => {
  try {
    const keyWord = req.query.keyWord;
    if (!keyWord) return res.status(400).json({ message: "Keyword is required" });

    const users = await User.find({
      $or: [
        { username: { $regex: keyWord, $options: "i" } },
        { full_name: { $regex: keyWord, $options: "i" } },
      ],
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: `Search error: ${error.message}` });
  }
};

// -------------------- GET ALL NOTIFICATIONS --------------------
export const getAllNotifications = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Clerk
    const notifications = await Notification.find({ receiver: userId })
      .populate("sender receiver post loop")
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: `Get notifications error: ${error.message}` });
  }
};

// -------------------- MARK NOTIFICATION AS READ --------------------
export const markAsRead = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Clerk
    const { notificationId } = req.body;

    if (!notificationId) return res.status(400).json({ message: "Notification ID required" });

    if (Array.isArray(notificationId)) {
      await Notification.updateMany(
        { _id: { $in: notificationId }, receiver: userId },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: userId },
        { $set: { isRead: true } }
      );
    }

    return res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    return res.status(500).json({ message: `Mark as read error: ${error.message}` });
  }
};
