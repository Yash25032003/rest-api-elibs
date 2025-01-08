import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

//attaching a new metadat in the request by creating a interface 
export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization"); // accessing the jwt token from the headers of postman
  if (!token) {
    return next(createHttpError(401, "Authorization token is required"));
  }

  try {
    const parsedToken = token.split(" ")[1]; // bearer keyword bhi hai token me to vo nahi chahiye aur space ke baad waale token ko hum parse karenge . Split method karne ke baad ek array banega jisme 0th index pe hoga bearer , 1st index pe hoga jwt token of array

    const decoded = verify(parsedToken, config.jwtsecret as string); // jwt ke verify method se hamne compare kiya hai jwtsecret and parsedtoken ko
    //   console.log('decoded token is ' , decoded);

    // new parameter dala hamne userId jo exist nahi kar raha tha req ke andar
    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;

    next(); // next likhna zaruri hai taaki next handler pe jaa paye hum na ki yahi atak jaye
  } catch (error) {
    return next(createHttpError(401, "Token expired"));
  }
};

export default authenticate;
