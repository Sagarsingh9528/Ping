import express from 'express'
import { upload } from '../configs/multer.js'
import { clerkAuth } from '../middleware/clerkauth.js'
import { comment, getAllLoops, like, uploadLoop } from '../controllers/loopController.js'


const loopRouter=express.Router()

loopRouter.post("/upload",clerkAuth,upload.single("media"),uploadLoop)
loopRouter.get("/getAll",clerkAuth,getAllLoops)
loopRouter.get("/like/:loopId",clerkAuth,like)

loopRouter.post("/comment/:loopId",clerkAuth,comment)

export default loopRouter