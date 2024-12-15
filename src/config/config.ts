import { config as conf } from "dotenv";

conf();

const _config ={
    // here right all the environment variables
    port: process.env.PORT,
    databaseurl:  process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtsecret: process.env.JWT_SECRET,
}; 
// Object.freeze is used for read only
export const config = Object.freeze(_config)

