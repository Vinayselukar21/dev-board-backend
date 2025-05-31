import { Router } from "express";
import {
  login,
  logout,
  me,
  meAll,
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
router.get("/me/:workspaceMemberId/all", meAll);

export default router;
