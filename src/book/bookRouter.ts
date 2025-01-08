import express from "express";
import multer from "multer";
import path from "node:path";
import {
  createBook,
  deleteBook,
  getSingleBook,
  listBooks,
  updateBook,
} from "./bookController";
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

bookRouter.patch(
  "/:bookId", // dynamically pass kiya hai hamne bookId ko by using :
  authenticate, // middleware to check users authentication

  // below middleware is from Multer and is used to handle file uploads. fields allows uploading multiple files with different field names
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.get("/", listBooks);
bookRouter.get("/:bookId", getSingleBook);
bookRouter.delete("/:bookId", authenticate, deleteBook)

export default bookRouter;
