import { Inngest } from "inngest";
import mongoose from "mongoose"; // ✅ default import
import User from "../models/userModel.js";
import Connection from "../models/connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// You can use mongoose.connection anywhere you need DB connection info:
// const { connection } = mongoose;

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
        data.email_addresses?.[0]?.email_address || `${data.id}@clerk.com`,
      full_name:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        "Unnamed User",
      username: data.username || undefined,
      profile_picture: data.profile_image_url || "",
    };

    console.log("Updating user in MongoDB:", updatedUserData);

    const updatedUser = await User.findByIdAndUpdate(
      data.id,
      updatedUserData,
      { new: true }
    );

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

/**
 * Send reminder when a new connection request is added
 */
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run("send-connection-request-mail", async () => {
      const connDoc = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );

      const subject = `New connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connDoc.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connDoc.from_user_id.full_name} - ${connDoc.from_user_id.username}</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
        <br/>
        <p>Thanks <br/>LinkUp - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: connDoc.to_user_id.email,
        subject,
        body,
      });
    });

    const in24hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await step.sleepUntil("wait-for-24-hours", in24hours);

    await step.run("send-connection-request-reminder", async () => {
      const connDoc = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );

      if (connDoc.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = `New connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connDoc.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connDoc.from_user_id.full_name} - ${connDoc.from_user_id.username}</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
        <br/>
        <p>Thanks <br/>LinkUp - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: connDoc.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder sent" };
    });
  }
);

// Inngest function to delete Story after 24 hours
const deleteStory = inngest.createFunction(
  {id: 'story-delete'},
  {event: 'app/story.delete'},
  async ({event, step}) => {
    const {storyId} = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await step.sleepUntil('wait-for-24-hours', in24Hours)
    await step.run('delete-story', async ()=>{
      await Story.findOneAndDelete(storyId)
      return {message: 'Story deleted.'}
    })
  }

)

const sendNotificationOfUnseenMessages = inngest.createFunction(
  {id: "send-unseen-messages-notification"},
  {cron: "TZ=America/New_York 0 9 * * *"}, //Every day 9 AM
  async ({step}) => {
    const messages = await Message.find({seen: false}).populate('to_user_id');
    const unseenCount = {}

    messages.map(message=> {
      unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1;
      })
      for (const userId in unseenCount) {
        const user = await User.findById(userId);

        const subject = `You have ${unseenCount[userId]} unseen messages`

        const body = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${user.full_name},</h2>
        <p>You have ${unseenCount[userId]} unseen messages</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them</p>
        <br/>
        <p>Thanks <br/>LinkUp - Stay Connected</p>
      </div>
        `;
        await sendEmail({
          to: user.email,
          subject,
          body
        })
      }
      return {message: "Notification sent."}

    
  }
)

// Export all Inngest functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendNotificationOfUnseenMessages
];
