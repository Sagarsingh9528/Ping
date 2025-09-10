import { Inngest } from "inngest";
import User from "../models/userModel.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "linkUp-app" });

/**
 * Sync user creation from Clerk → MongoDB
 */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    let email = email_addresses?.[0]?.email_address || null;
    let username = email ? email.split("@")[0] : `user_${Date.now()}`;

    // check availability of username
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      username = `${username}_${Math.floor(Math.random() * 10000)}`;
    }

    const userData = {
      _id: id, // Clerk user id as primary key
      email,
      full_name: `${first_name || ""} ${last_name || ""}`.trim() || "Unnamed User",
      profile_picture: image_url || "",
      username,
    };

    const newUser = new User(userData);
    await newUser.save();

    return { success: true, message: "User created", user: newUser };
  }
);

/**
 * Sync user update from Clerk → MongoDB
 */
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const updatedUserData = {
      email: email_addresses?.[0]?.email_address || null,
      full_name: `${first_name || ""} ${last_name || ""}`.trim() || "Unnamed User",
      profile_picture: image_url || "",
    };

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, {
      new: true,
    });

    return { success: true, message: "User updated", user: updatedUser };
  }
);

/**
 * Sync user deletion from Clerk → MongoDB
 */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
    return { success: true, message: `User ${id} deleted` };
  }
);

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
