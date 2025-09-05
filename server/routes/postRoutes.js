import express from 'express'
import { clerkAuth } from '../middleware/clerkauth.js'
import { upload } from '../configs/multer.js'
import { comment, getAllPosts, like, saved, uploadPost } from '../controllers/postController.js'

const postRouter = express.Router()

postRouter.post("/upload",clerkAuth,upload.single("media"),uploadPost)
postRouter.get("/getAll",clerkAuth,getAllPosts)
postRouter.get("/like/:postId",clerkAuth,like)
postRouter.get("/saved/:postId",clerkAuth,saved)
postRouter.post("/comment/:postId",clerkAuth,comment)

export default postRouter