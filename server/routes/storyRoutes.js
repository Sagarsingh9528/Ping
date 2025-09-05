import express from 'express'
import { clerkAuth } from '../middleware/clerkauth.js'
import { upload } from '../configs/multer.js'
import { getAllStories, getStoryByUserName, uploadStory, viewStory } from '../controllers/storyController.js'

const storyRouter = express.Router()

storyRouter.post("/upload",clerkAuth,upload.single("media"),uploadStory)
storyRouter.get("/getByUserName/:userName",clerkAuth,getStoryByUserName)
storyRouter.get("/getAll",clerkAuth,getAllStories)
storyRouter.get("/view/:storyId",clerkAuth,viewStory)

export default storyRouter