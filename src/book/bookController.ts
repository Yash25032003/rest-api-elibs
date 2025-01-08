import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middleware/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log("files", req.files);
  // res.json({ message: "Files Submiitted" });
  const { title, genre } = req.body;

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );

    // uploading and handling images in cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    // handling pdf in cloudinary
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const _req = req as AuthRequest;

    // Database me send kar rahe hai newBook ko jo user ne cloudinary pe upload ki hai
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url, // access coverImage from cloudinary
      file: bookFileUploadResult.secure_url, // access file from cloudinary
    });

    // delete temperory files after uploading of files is completed
    try {
      await fs.promises.unlink(filePath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
    }

    res.status(201).json({ id: newBook._id });

    console.log("Uploaded file", uploadResult);
    console.log("Uploaded file", bookFileUploadResult);
    console.log("userId", _req.userId);

    // res.json({ message: "Files Submiitted" });
  } catch (error) {
    console.log(error);
    return next(
      createHttpError(500, "Something went wrong while uploading the files")
    );
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;
  // accessing book id from url
  const bookId = req.params.bookId;

  // checking ki book DB me exist kar rahi hai ki nahi
  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // check access means jo book me changes kar raha hai vo ushi ki book hai na

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(
      createHttpError(403, "Updation of others book is not possible")
    );
  }

  // agar coverImage user ne daal hogi previously to hi changes karenge
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";

  try {
    if (files.coverImage) {
      const filename = files.coverImage[0].filename;
      const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
      // send files to cloudinary
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads/" + filename
      );
      completeCoverImage = filename;
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: completeCoverImage,
        folder: "book-covers",
        format: converMimeType,
      });

      completeCoverImage = uploadResult.secure_url;
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    return next(createHttpError(403, "Upload of result not done"));
  }

  // handling files in form of pdf
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);

    // const coverFileSplit = book.coverImage.split("/");
    // const coverImagePublicId =
    //   coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split(".").at(-2);

    //   await cloudinary.uploader.destroy(coverImagePublicId);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      description: description,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In production grade hum pagination ka use karte hai
    // accessing the entries int he DB of books
    const book = await bookModel.find();

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error while accesing the book"));
  }
  // res.json({ message: "listbooks" });
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // accessing the book id
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(403, "Book not found in the DB"));
    }

    // get the book then show the response
    res.json(book);
  } catch (error) {
    return next(createHttpError(403, "Error while getting a book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  // check ki book hai bhi ki nahi DB me
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found in the DB"));
  }
  // check ki ye user book ko delete kar sakta hai ki nahi

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You cannot access these book"));
  }

  // now hame cloudinary se delete karna hai image ko
  // access the image ki id from url
  // handling the images

  const coverFileSplit = book.coverImage.split("/");
  // jis format me cloudinary me hai wese hi hum access kar rahe hai
  const coverImagePublicId =
    coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split(".").at(-2); // .png nahi chahiye the hame because cloudinary me nahi tha vo

  // console.log("Split is ", coverFileSplit);
  console.log("final Split is ", coverImagePublicId);

  // handling the files
  const bookFileSplits = book.file.split("/");
  const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1); //.pdf chahiye to usse rakhenge split nahi karenge

  console.log("book File Id", bookFilePublicId);

  try {
    // deleted fro cloudinary
    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: "raw",
    });

    // DB se delete karo
    await bookModel.deleteOne({ _id: bookId });
    res.json({ message: "deleted book is", bookId });
  } catch (error) {
    return next(createHttpError(403, "Resource not deleted from cloudinary"));
  }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
