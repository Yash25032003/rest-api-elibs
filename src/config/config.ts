import { config as conf } from "dotenv";

conf();

const _config = {
  // here right all the environment variables
  port: process.env.PORT,
  databaseurl: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtsecret: process.env.JWT_SECRET,
  cloudinaryCloud: process.env.CLOUDINARY_CLOUD,
  cloudinaryApikey: process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
  frontendDomain: process.env.FRONT_END_DOMAIN,
};
// Object.freeze is used for read only
export const config = Object.freeze(_config);
