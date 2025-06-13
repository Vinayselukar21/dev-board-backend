import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getPermissions } from "../utils/getPermissions";

interface JwtPayload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
  name: string;
  email: string;
  lastLogin: string;
  orgPermissions: string[];
  workspacePermissions: {
    workspaceName: string;
    workspaceId: string;
    permissions: string[];
  }[];
}

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

const verifyAccessToken = async(
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
    const { orgPermissions, workspacePermissions } = await getPermissions(decoded.id);
    req.user = {
      ...decoded,
      orgPermissions,
      workspacePermissions: workspacePermissions || [],
    };
    // console.log(orgPermissions, "orgPermissions", workspacePermissions, "workspacePermissions")
    next();
  } catch (err) {
    console.log(err, "error in verifyAccessToken")
    res.sendStatus(403);
    return;
  }
};
export default verifyAccessToken;
