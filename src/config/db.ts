import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("connected to DB successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.log("Error in connecting the DB", err);
    });

    await mongoose.connect(config.databaseurl as string);
  } catch (error) {
    console.error("Failed to connect to DB", error);
    process.exit(1);
  }
};

export default connectDB;
