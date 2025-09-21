import imagekit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../models/connection.js";
import Post from "../models/Post.js";
import User from "../models/userModel.js";
import fs from "fs";

async function findCurrentUser(clerkUserId) {
  
  return User.findOne({ _id: clerkUserId });
  
}


export const getUserData = async (req, res) => {
  console.log("abced")
  try {
    const { userId } = await req.auth(); 
    const user = await findCurrentUser(userId);
    console.log(user)

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateUserData = async (req, res) => {
  try {
    const { userId } = await req.auth(); 
    let { username, bio, location, full_name } = req.body;

    const tempUser = await findCurrentUser(userId);
    if (!tempUser)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!username) username = tempUser.username;

    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) username = tempUser.username;
    }

    const updatedData = { username, bio, location, full_name };

    
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

      fs.unlinkSync(profile.path);
    }

    
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

    const user = await User.findByIdAndUpdate(tempUser._id, updatedData, {
      new: true,
    });
    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const discoverUsers = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ fixed
    const { input } = req.body;
    const me = await findCurrentUser(userId);

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter((u) => u._id.toString() !== me._id.toString());
    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const followUser = async (req, res) => {
  try {
    const { userId } = await req.auth(); 
    const { id } = req.body;

    const me = await findCurrentUser(userId);
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    if (me._id.toString() === id)
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });

    const toUser = await User.findById(id);
    if (!toUser) return res.status(404).json({ success: false, message: "Target user not found" });

    if (me.following.includes(id))
      return res.json({ success: false, message: "Already following this user" });

    me.following.push(id);
    await me.save();

    toUser.followers.push(me._id);
    await toUser.save();

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const unfollowUser = async (req, res) => {
  try {
    const { userId } = await req.auth(); 
    const { id } = req.body;

    const me = await findCurrentUser(userId);
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    if (me._id.toString() === id)
      return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });

    const toUser = await User.findById(id);
    if (!toUser) return res.status(404).json({ success: false, message: "Target user not found" });

    me.following = me.following.filter((f) => f.toString() !== id);
    await me.save();

    toUser.followers = toUser.followers.filter((f) => f.toString() !== me._id.toString());
    await toUser.save();

    res.json({ success: true, message: "You unfollowed this user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = await req.auth(); 
    const { id } = req.body;

    const me = await findCurrentUser(userId);
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: me._id,
      created_at: { $gt: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message: "You have sent more than 20 connection requests in the last 24 hours",
      });
    }

    const connection = await Connection.findOne({
      $or: [
        { from_user_id: me._id, to_user_id: id },
        { from_user_id: id, to_user_id: me._id },
      ],
    });

    if (!connection) {
      const newConnection = await Connection.create({
        from_user_id: me._id,
        to_user_id: id,
      });

      await inngest.send({
        name: "app/connection-request",
        data: { connectionId: newConnection._id },
      });

      return res.json({ success: true, message: "Connection request sent successfully" });
    } else if (connection.status === "accepted") {
      return res.json({ success: false, message: "You are already connected with this user" });
    }

    return res.json({ success: false, message: "Connection request pending" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getUserConnections = async (req, res) => {
  try {
    const { userId } = await req.auth(); 
    const me = await findCurrentUser(userId);
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    const user = await User.findById(me._id).populate("connections followers following");

    const pendingConnections = (
      await Connection.find({ to_user_id: me._id, status: "pending" }).populate(
        "from_user_id"
      )
    ).map((connection) => connection.from_user_id);

    res.json({
      success: true,
      connections: user.connections,
      followers: user.followers,
      following: user.following,
      pendingConnections,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = await req.auth(); 
    const { id } = req.body;

    const me = await findCurrentUser(userId);
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: me._id,
    });

    if (!connection)
      return res.status(404).json({ success: false, message: "Connection not found" });

    const otherUser = await User.findById(id);
    if (!otherUser)
      return res.status(404).json({ success: false, message: "Target user not found" });

    me.connections.push(id);
    await me.save();

    otherUser.connections.push(me._id);
    await otherUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const posts = await Post.find({ user: profileId }).populate("user");
    res.json({ success: true, profile, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
