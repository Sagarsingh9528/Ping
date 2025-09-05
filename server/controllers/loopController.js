import uploadOnCloudinary from "../configs/cloudinary.js";
import Loop from "../models/loopModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export const uploadLoop = async (req, res) => {
  try {
    const { caption } = req.body;
    let media;
    if (req.file) {
      media = await uploadOnCloudinary(req.file.path);
    } else {
      return res.status(400).json({ message: "media is required" });
    }
    const loop = await Loop.create({
      caption,
      media,
      author: req.auth.userId, // create loop in DB
    });
    const user = await User.findById(req.userId);
    user.loops.push(loop._id); // add loop id to user’s loops array
    await user.save();

     const populatedLoop=await Loop.findById(loop._id)
      .populate("author","full_name username profile_picture")
      return res.status(201).json(populatedLoop)
  } catch (error) {
    return res.status(500).json({message:`uploadloop error ${error}`})
  }
};

export const like = async (req, res) => {
    try {
         const loopId=req.params.loopId
         const loop=await Loop.findById(loopId)
         if(!loop){
            return res.status(400).json({message:"loop not found"})
        }
        const alreadyLiked=loop.likes.some(id=>id.toString()==req.userId.toString())
          if(alreadyLiked){
        loop.likes=loop.likes.filter(id=>id.toString()!=req.userId.toString()) // unlike
    }else{
        loop.likes.push(req.userId)  // like

        if (loop.author._id != req.userId) {
            await Notification.create({
              sender: req.userId,
              receiver: loop.author._id,
              type: "like",
              loop: loop._id,
              message:"liked your loop"
            })
        }
    }
      await loop.save()
    await loop.populate("author","name userName profileImage")

    return res.status(200).json(loop)
    } catch (error) {
        return res.status(500).json({message:`like loop error ${error}`})
    }
}

export const comment=async (req,res)=>{
  try {
    const {message}=req.body
    const loopId=req.params.loopId
    const loop=await Loop.findById(loopId)
    if(!loop) return res.status(400).json({message:"loop not found"})

    loop.comments.push({
      author:req.userId,
      message
    })

    if (loop.author._id != req.userId) {
        await Notification.create({
          sender: req.userId,
          receiver: loop.author._id,
          type: "comment",
          loop: loop._id,
          message:"commented on your loop"
        })
    }

    await loop.save()
    await loop.populate("author","name userName profileImage")
    await loop.populate("comments.author")   // also get comment author details

    return res.status(200).json(loop)
  } catch (error) {
    return res.status(500).json({message:`comment loop error ${error}`})
  }
}

export const getAllLoops=async (req,res)=>{
  try {
    const loops=await Loop.find({})
      .populate("author","name userName profileImage")
      .populate("comments.author")

    return res.status(200).json(loops)
  } catch (error) {
    return res.status(500).json({message:`get all loop error ${error}`})
  }
}

