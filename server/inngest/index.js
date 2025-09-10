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

    // Extract Clerk fields safely
    const _id = data.id;
    const first_name = data.first_name || "";
    const last_name = data.last_name || "";
    const email =
      data.email_addresses?.[0]?.email_address || `${_id}@clerk.com`;
    const username =
      data.username ||
      (email ? email.split("@")[0] : `user_${_id.slice(0, 8)}`);
    const profile_picture = data.profile_image_url || "";

    // Ensure unique username
    let finalUsername = username;
    const existingUser = await User.findOne({ username: finalUsername });
    if (existingUser) {
      finalUsername = `${finalUsername}_${Math.floor(Math.random() * 10000)}`;
    }

    const userData = {
      _id,
      email,
      full_name: `${first_name} ${last_name}`.trim() || "Unnamed User",
      username: finalUsername,
      profile_picture,
    };

    console.log("Creating user in MongoDB:", userData);

    // Save user
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
    const data = event.data;

    const updatedUserData = {
      email:
        data.email_addresses?.[0]?.email_address ||
        `${data.id}@clerk.com`,
      full_name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unnamed User",
      username: data.username || undefined, // optional: only update if present
      profile_picture: data.profile_image_url || "",
    };

    console.log("Updating user in MongoDB:", updatedUserData);

    const updatedUser = await User.findByIdAndUpdate(data.id, updatedUserData, {
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
    console.log(`Deleted user: ${id}`);
    return { success: true, message: `User ${id} deleted` };
  }
);

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
