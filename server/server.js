import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import loopRouter from './routes/loopRoutes.js';


const app = express();
await connectDB();
// const port = 8080;

app.use(express.json());
app.use(cors());


app.get('/', (req, res)=>res.send('server is running'));
app.use('/api/user', userRouter)
app.use("/api/post",postRouter)
app.use("/api/loop",loopRouter)
app.use("/api/story",storyRouter)
app.use("/api/message",messageRouter)

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>console.log(`Server is running on port: ${PORT}`));