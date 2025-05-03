import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
  name: string;
  email: string;
  lastLogin: string;
}

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

const verifyAccessToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;
  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(403);
    return;
  }
};
export default verifyAccessToken;
