import express from "express";
import multer from "multer";
import path from "node:path";
import { createBook } from "./bookController";
import authenticate from "../middleware/authenticate";
const bookRouter = express.Router();

//! Multer ke through hum form data ko handle kar sakte hai

// upload jo hai vo file upload handle kar raha hai
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 1e7 }, // 10MB
});

// .fields se hum multiple files upload kar sakte hai
bookRouter.post(
  "/",
  authenticate, // middleware to check users authentication
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;
