import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    fs.unlinkSync(file);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(file)
    console.log(error)
  }
};

export default uploadOnCloudinary
