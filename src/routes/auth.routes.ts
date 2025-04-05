import { Router } from "express";
import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller";
import verifyAccessToken from "../middlewares/verifyAccessToken";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyAccessToken, me);

export default router;
