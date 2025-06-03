import { jwtSecret } from "../index";
import jwt from "jsonwebtoken";


export async function generateTokens(user: {
    id: string;
    email: string;
    name: string | null;
    lastLogin: string;
    orgPermissions: string[];
    workspacePermissions: {
      workspaceName: string;
      workspaceId: string;
      permissions: string[];
    }[];
}) {
  // using HS256 algorithm
  const accessToken = jwt.sign(
    { id: user.id, name: user.name, email: user.email, lastLogin: user.lastLogin, orgPermissions: user.orgPermissions, workspacePermissions: user.workspacePermissions },
    jwtSecret.accessToken,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name, lastLogin: user.lastLogin, orgPermissions: user.orgPermissions, workspacePermissions: user.workspacePermissions },
    jwtSecret.refreshToken,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
}