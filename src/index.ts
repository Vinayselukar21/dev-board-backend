import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import cookieParser from "cookie-parser";
import cors from "cors";
import verifyAccessToken from "./middlewares/verifyAccessToken";

export const prisma = new PrismaClient().$extends(withAccelerate());

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
export const jwtSecret = {
  accessToken: process.env.ACCESS_TOKEN_SECRET || "",
  refreshToken: process.env.REFRESH_TOKEN_SECRET || "",
};

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", verifyAccessToken, (req, res) => {
  res.send("Hello TypeScript + Express!");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
