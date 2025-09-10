import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk user ID (e.g. user_xxx)
    email: { type: String, unique: true, index: true },
    password: { type: String, select: false }, // unused with Clerk
    full_name: { type: String, required: true },
    username: { type: String, unique: true, index: true, sparse: true }, 
    bio: { type: String, default: "Hey there! I am using LinkUp." },
    location: { type: String, default: "" },
    profile_picture: { type: String, default: "" },
    cover_photo: { type: String, default: "" },

    // Use Clerk string IDs instead of ObjectIds
    followers: [{ type: String, ref: "User" }],
    following: [{ type: String, ref: "User" }],
    connections: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

const User = mongoose.model("User", userSchema);

export default User;
