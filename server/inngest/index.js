import { Inngest } from "inngest";
import User from "../models/userModel.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "linkUp-app" });

//Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event})=>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        // check avilabily of user name 
        const user = await User.findOne({username})

        if (user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        }
    }
)

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event})=>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
        }
       await User.findByIdAndUpdate(id, updatedUserData)
       
    }
)
// Inngest Delete the user 
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event})=>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        await User.findByIdAndDelete(id)

       
       
       
    }
)


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];