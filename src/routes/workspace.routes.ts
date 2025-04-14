import { Router } from "express";
import {
  addWorkspaceMember,
  createDepartment,
  // Workspace Projects Related
  createProject,
  // Workspace Related
  createWorkspace,
  getDepartments,
  getWorkspaceById,
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaces
} from "../controllers/workspace.controller";
import verifyAccessToken from "../middlewares/verifyAccessToken";

const router = Router();

// Workspace Routes
router.post("/create", verifyAccessToken, createWorkspace); // create a new workspace - done
// router.put("/update/:id", verifyAccessToken, updateWorkspace); // update a workspace
// router.delete("/delete/:id", verifyAccessToken, deleteWorkspace); // delete a workspace
router.get("/getall/:ownerId", verifyAccessToken, getWorkspaces); // fetch workspaces -done
router.get("/getbyid/:workspaceId", verifyAccessToken, getWorkspaceById); // fetch a workspace by id

// Workspace Projects Routes
router.post("/newproject", verifyAccessToken, createProject); // create a new project
router.get("/:workspaceId/getall", verifyAccessToken, getWorkspaceProjects); // fetch all projects in a workspace

// Workspace Member Routes
router.post("/:workspaceId/addmember", verifyAccessToken, addWorkspaceMember); // add a new member to a workspace
router.get("/:workspaceId/members", verifyAccessToken, getWorkspaceMembers); // fetch all members in a workspace

// Department Routes
router.post("/newdepartment", verifyAccessToken, createDepartment); // create a new department
router.get("/:workspaceId/getall", verifyAccessToken, getDepartments); // fetch all departments in a workspace

export default router;
