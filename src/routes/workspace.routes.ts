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

export default router;
