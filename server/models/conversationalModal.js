import mongoose from "mongoose";

const { Schema } = mongoose;  

const conversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],
    messages: [
      { type: Schema.Types.ObjectId, ref: "Message" }
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
