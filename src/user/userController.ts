import { Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // steps in handling requests

  const { name, email, password } = req.body;

  //   validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are Required"); // 400-499 status error code jo hai client error me send karte hai

    //! The next function is used to pass the error object to the next middleware
    return next(error);
  }
  res.json({ message: "User registered successfully" });
};

export { createUser };
