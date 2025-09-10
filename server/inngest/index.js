import { Inngest } from "inngest";
import User from "../models/userModel.js";

// Create Inngest client
export const inngest = new Inngest({ id: "linkUp-app" });

/**
 * Sync user creation from Clerk → MongoDB
 */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const data = event.data;

    const _id = data.id;
    const full_name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unnamed User";
    const email = data.email_addresses?.[0]?.email_address || `${_id}@clerk.com`;
    let username = data.username || (_id ? `user_${_id.slice(0, 8)}` : `user_${Date.now()}`);
    const profile_picture = data.profile_image_url || "";

    // Ensure username uniqueness
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      username = `${username}_${Math.floor(Math.random() * 10000)}`;
    }

    const userData = {
      _id,
      full_name,
      email,
      username,
      profile_picture,
      bio: "Hey there! I am using LinkUp.",
      location: "",
      followers: [],
      following: [],
      connections: [],
    };

    const existingUser = await User.findById(_id);
    if (!existingUser) {
      const newUser = new User(userData);
      await newUser.save();
      console.log("✅ User created:", full_name);
      return { success: true, user: newUser };
    }

    console.log("⚠️ User already exists:", full_name);
    return { success: false, message: "User already exists" };
  }
);

/**
 * Sync user update from Clerk → MongoDB
 */
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const data = event.data;

    const _id = data.id;
    const full_name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unnamed User";
    const email = data.email_addresses?.[0]?.email_address || `${_id}@clerk.com`;
    const username = data.username || (_id ? `user_${_id.slice(0, 8)}` : `user_${Date.now()}`);
    const profile_picture = data.profile_image_url || "";

    const updatedUserData = {
      full_name,
      email,
      username,
      profile_picture,
    };

    const updatedUser = await User.findByIdAndUpdate(_id, updatedUserData, { new: true });
    console.log("✏️ User updated:", full_name);
    return { success: true, user: updatedUser };
  }
);

/**
 * Sync user deletion from Clerk → MongoDB
 */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id: _id } = event.data;
    await User.findByIdAndDelete(_id);
    console.log("🗑️ User deleted:", _id);
    return { success: true, message: `User ${_id} deleted` };
  }
);

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
