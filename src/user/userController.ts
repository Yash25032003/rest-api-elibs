import { Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // steps in handling requests

  const { name, email, password } = req.body;

  //   validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are Required"); // 400-499 status error code jo hai client error me send karte hai

    //! The next function is used to pass the error object to the next middleware
    return next(error);
  }
  // res.json({ message: "User registered successfully" });

  // Database call
  try {
    const user = await userModel.findOne({ email: email }); // finding email in DB

    // if email existed in DB
    if (user) {
      // const error = createHttpError(400, "User already existed");
      // return next(error);

      res.status(400).json({ message: "User already exist" });
    }
  } catch (err) {
    return next(createHttpError(500, "Error while getting user"));
  }

  let newUser: User;

  // password hash
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (err) {
    return next(createHttpError(500, "error while creating user"));
    // res.status(500).json({ message: "error while creating user" });
  }

  try {
    // token generation jwt
    const token = sign(
      { sub: (await newUser)._id },
      config.jwtsecret as string,
      {
        expiresIn: "7d",
      }
    );

    // response
    res.status(201).json({ accessToken: token });
  } catch (err) {
    return next(createHttpError(500, "error while signing the jwt token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // validation of fields
  if (!email || !password) {
    return next(createHttpError("400", "All fields are required"));
  }

  // find user in DB
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return next(createHttpError(404, "User not found."));
    }

    // verify the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(400, "Username or password incorrect!"));
    }

    // access token generate
    const token = sign({ sub: (await user)._id }, config.jwtsecret as string, {
      expiresIn: "7d",
    });
    // response
    res.status(201).json({ accessToken: token });
  } catch (err) {
    return next(createHttpError("401", "Error found"));
  }
};

export { createUser, loginUser };
