import { jwtSecret } from "../index";
import jwt from "jsonwebtoken";


export async function generateTokens(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    lastLogin: string;
}) {
  // using HS256 algorithm
  const accessToken = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin },
    jwtSecret.accessToken,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, lastLogin: user.lastLogin },
    jwtSecret.refreshToken,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
}