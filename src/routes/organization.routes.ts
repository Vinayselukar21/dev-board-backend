import { Router } from "express";
import verifyAccessToken from "../middlewares/verifyAccessToken";
import { createOrganization, getMyOrganization, registerAndAddMember } from "../controllers/organization.controller";

const router = Router();

// Organization Routes
router.get("/myorg", verifyAccessToken, getMyOrganization);

router.post("/new/organization", verifyAccessToken, createOrganization);

router.post("/new/orgmember", verifyAccessToken, registerAndAddMember);

export default router;