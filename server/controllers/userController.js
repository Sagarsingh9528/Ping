import imagekit from "../configs/imageKit.js";
import Connection from "../models/connection.js";
import User from "../models/userModel.js";
import fs from "fs";

// Get user data using userId
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth; // ✅ req.auth is object, not function
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth;
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Use old username if not provided
    if (!username) username = tempUser.username;

    // Check if username is already taken
    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = tempUser.username; // fallback to old username
      }
    }

    const updatedData = { username, bio, location, full_name };

    // Profile upload
    if (req.files?.profile?.[0]) {
      const profile = req.files.profile[0];
      const buffer = fs.readFileSync(profile.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      updatedData.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });

      fs.unlinkSync(profile.path); // ✅ remove local temp file
    }

    // Cover upload
    if (req.files?.cover?.[0]) {
      const cover = req.files.cover[0];
      const buffer = fs.readFileSync(cover.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      updatedData.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });

      fs.unlinkSync(cover.path);
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Find users using username, email, location, name
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter(
      (u) => u._id.toString() !== userId.toString()
    );

    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "Already following this user",
      });
    }

    user.following.push(id);
    await user.save();

    toUser.followers.push(userId);
    await toUser.save();

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Remove following
    user.following = user.following.filter(
      (f) => f.toString() !== id.toString()
    );
    await user.save();

    // Remove follower
    toUser.followers = toUser.followers.filter(
      (f) => f.toString() !== userId.toString()
    );
    await toUser.save();

    res.json({ success: true, message: "You unfollowed this user" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Send connection Request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message:
          "You have sent more than 20 connection requests int the last 24 hours",
      });
    }

    // check if users are already connected or not
    const connection = await Connection.findOne({
      $or: [
        {
          from_user_id: userId,
          to_user_id: id,
        },
        {
          from_user_id: id,
          to_user_id: userId,
        },
      ],
    });
    if (!connection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });
      return res.json({
        success: true,
        message: "Connection request ent successfully",
      });
    } else if (connection && connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }
    return res.json({ success: false, message: "connection request Prnding" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId).populate('connections followers following')

    const connections = user.connections
    const followers = user.followers
    const following = user.following

    const pendingConnections = ((await Connection.find({to_user_id: userId, status: pending}).populate('from_user_id')).map(connection=>connection.from_user_id))

    res.json({success: true, connections, followers, following, pendingConnections})
    
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {id} = req.body;

    const connection = await Connection.findOne({from_user_id: id, to_user_id: userId})

    if (!connection) {
        return res.json({ success: false, message: 'Connection not found' });
    }

    const user = await User.findById(userId)
    user.connections.push(id);
    await user.save()

    const toUser = await User.findById(id)
    toUser.connections.push(userId);
    await toUser.save()

    connection.status = 'accepted';
    await connection.save()

    res.json({success: true, message: 'Connection accepted successfully'})
   
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};