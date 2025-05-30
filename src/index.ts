import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import verifyAccessToken from "./middlewares/verifyAccessToken";
import authRoutes from "./routes/auth.routes";
import workspaceRoutes from "./routes/workspace.routes";
import projectRoutes from "./routes/project.routes";
import organizationRoutes from "./routes/organization.routes";

export const prisma = new PrismaClient().$extends(withAccelerate());
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
export const jwtSecret = {
  accessToken: process.env.ACCESS_TOKEN_SECRET || "",
  refreshToken: process.env.REFRESH_TOKEN_SECRET || "",
};

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3003",
    credentials: true,
  })
);

app.get("/", verifyAccessToken, (req, res) => {
  res.send("Up and Running!");
});

app.use("/api/organization", organizationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
