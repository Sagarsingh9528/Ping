import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mediaType:{
        type: String,
        enum: ["image", "video", "text"],
        required: true
    },
    media:{
        type: String,
        required: true
    },
    viewers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    createdAt:{
        type: Date,
        default:Date.now(),
        expires: 86400
    }

   

}, {timestamps: true})

const story = mongoose.model("Story", storySchema)
export default story