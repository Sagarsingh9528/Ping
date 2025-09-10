import mongoose from "mongoose";
const { Schema } = mongoose;  

const userSchema = new mongoose.Schema(
  {
    _id: {type: String, require: true},
    email: { type: String, unique: true, index: true },
    password: { type: String, select: false },
    full_name: { type: String, required: true },
    username: { type: String, unique: true, index: true },
    bio: { type: String, default: "Hey there! I am using LinkUp." },
    location: { type: String, default: "" },
    profile_picture: { type: String, default: "" },
    cover_photo: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    loops: [{ type: mongoose.Schema.Types.ObjectId, ref: "Loop" }],
    story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    connections: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

const User = mongoose.model("User", userSchema);

export default User;
