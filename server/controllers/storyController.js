import uploadOnCloudinary from "../configs/cloudinary.js";
import story from "../models/storyModel.js";
import User from "../models/userModel.js";

export const uploadStory = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.story) {
            await story.findByIdAndDelete(user.story)
            user.story = null
            
        }
        const {mediaType} = req.body

        let media;
        if (req.file) {
            media = await uploadOnCloudinary(req.file.path)
        }
        else{
            return res.status(400).json({ message: "media is required" })
        }
          const story = await Story.create({
            author: req.userId, mediaType, media
        })
        user.story = story._id
        await user.save()
        const populatedStory = await Story.findById(story._id).populate("author", "name userName profileImage")
            .populate("viewers", "name userName profileImage")
        return res.status(200).json(populatedStory)
    } catch (error) {
        return res.status(500).json({ message: "story upload error" })
        
    }
}

export const viewStory = async (req, res) => {
    try {
        const storyId = req.params.storyId
        const story = await story.findById(storyId)

        if (!story) {
             return res.status(400).json({ message: "story not found" })
            
        }

        const viewersIds = story.viewers.map(id => id.toString())
        if (!viewersIds.includes(req.userId.toString())) {
            story.viewers.push(req.userId)
            await story.save()
        }
        const populatedStory = await Story.findById(story._id).populate("author", "name userName profileImage")
            .populate("viewers", "name userName profileImage")
        return res.status(200).json(populatedStory)
        
    } catch (error) {
        return res.status(500).json({ message: "story view error" })
    }
}

export const getStoryByUserName = async (req, res) => {
    try {
        const username = req.params.username
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

          const story=await Story.find({
            author:user._id
        }).populate("viewers author")

         return res.status(200).json(story)
    } catch (error) {
         return res.status(500).json({ message: "story get by userName error" })
        
    }
}

export const getAllStories = async (req, res) => {
    try {
          const currentUser=await User.findById(req.userId)
        const followingIds=currentUser.following

        const stories=await Story.find({
            author:{$in:followingIds}
        }).populate("viewers author")
           .sort({createdAt:-1})

           return res.status(200).json(stories)
    } catch (error) {
         return res.status(500).json({ message: "All story get error" })
        
    }
}
