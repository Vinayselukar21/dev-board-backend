import { Router } from "express";
import verifyAccessToken from "../middlewares/verifyAccessToken";
import { createOrganization, getMyOrganization, registerAndAddMember, getAllRoles, createCustomRole } from "../controllers/organization.controller";

const router = Router();

// Organization Routes
router.get("/myorg", verifyAccessToken, getMyOrganization);

router.post("/new/organization", verifyAccessToken, createOrganization);

router.post("/new/orgmember", verifyAccessToken, registerAndAddMember);

router.get("/:organizationId/:workspaceId/roles/getall", verifyAccessToken, getAllRoles)

router.post("/new/customrole", verifyAccessToken, createCustomRole)

export default router;  