import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: config.frontendDomain,
  })
);

//? This middleware is essential for handling data sent in the body of requests
app.use(express.json());

//routes
// http methods : PUT , POST , GET , DELETE , PATCH

app.get("/", (req, res, next) => {
  const error = createHttpError(400, "something went wrong");
  throw error;
  res.json({ message: "welcome to the rest api course" });
});

// global handler

// app.use(globalErrorHandler);

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

export default app;
