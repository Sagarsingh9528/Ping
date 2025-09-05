import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type:{
        type: String,
        enum: ["like", "comment", "follow", "message"],
        required: true
    },
    message:{
        type: String,
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
    },
    loop:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"loop"
    },
    chatMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    isRead:{
        type: Boolean,
        default: false
    }

}, {timestamps: true})

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification