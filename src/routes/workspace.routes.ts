import { Router } from "express";
import verifyAccessToken from "../middlewares/verifyAccessToken";
import {
  // Workspace Related
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  getWorkspaces,
  updateWorkspace,

  // Workspace Projects Related
  createProject,
  getWorkspaceProjects,
  addWorkspaceMember,
  getWorkspaceMembers,
  createDepartment,
  getDepartments,
} from "../controllers/workspace.controller";

const router = Router();

// Workspace Routes
router.post("/create", verifyAccessToken, createWorkspace); // create a new workspace - done
// router.put("/update/:id", verifyAccessToken, updateWorkspace); // update a workspace
// router.delete("/delete/:id", verifyAccessToken, deleteWorkspace); // delete a workspace
router.get("/getall/:id", verifyAccessToken, getWorkspaces); // fetch workspaces -done
router.get("/getbyid/:id", verifyAccessToken, getWorkspaceById); // fetch a workspace by id

// Workspace Projects Routes
router.post("/:id/newproject", verifyAccessToken, createProject); // create a new project  
router.get("/:id/getall", verifyAccessToken, getWorkspaceProjects); // fetch all projects in a workspace 

// Workspace Member Routes
router.post("/:id/addmember", verifyAccessToken, addWorkspaceMember); // add a new member to a workspace
router.get("/:id/members", verifyAccessToken, getWorkspaceMembers); // fetch all members in a workspace

// Department Routes
router.post("/:id/newdepartment", verifyAccessToken, createDepartment); // create a new department
router.get("/:id/getall", verifyAccessToken, getDepartments); // fetch all departments in a workspace

export default router;
