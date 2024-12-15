import { Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

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

  // Database call
  const user = await userModel.findOne({ email: email }); // finding email in DB

  // if email existed in DB
  if (user) {
    const error = createHttpError(400, "User already existed");
  }

  // password hash
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userModel.create({
    name,
    email,
    password: hashedPassword,
  });

  // token generation jwt
  const token = sign({ sub: (await newUser)._id }, config.jwtsecret as string, {
    expiresIn: "7d",
  });

  // response
  res.json({ accessToken: token });
};

export { createUser };
