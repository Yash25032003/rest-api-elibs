import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";


cloudinary.config({
  cloud_name: config.cloudinaryCloud,
  api_key: config.cloudinaryApikey,
  api_secret: config.cloudinarySecret, // Click 'View API Keys' above to copy your API secret
});

export default cloudinary
