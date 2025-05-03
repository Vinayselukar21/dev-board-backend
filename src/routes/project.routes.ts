import Router from "express";
import verifyAccessToken from "../middlewares/verifyAccessToken";
import {
  getMembers,
  addMemberToProject,
  createTaskStage,
  createTask,
  getAllTasksForProject,
  getProjectById,
  changeTaskStage,
  deleteTask,
  getProjectLogs
} from "../controllers/project.controllers";

const router = Router();

// Get project logs
router.get("/:workspaceId/logs", verifyAccessToken, getProjectLogs);

// Get project details by id 
router.get("/getbyid/:projectId", verifyAccessToken, getProjectById); // fetch a project by id 

// Project Routes
router.post("/addmember", verifyAccessToken, addMemberToProject);
router.get("/:id/members", verifyAccessToken, getMembers);

// Project Tasks Stage Routes
router.post("/newstage", verifyAccessToken, createTaskStage);

// Project Tasks Routes
router.post("/newtask", verifyAccessToken, createTask);
router.get("/:projectId/tasks", verifyAccessToken, getAllTasksForProject);
router.put("/taskstagechange", verifyAccessToken, changeTaskStage);
// router.get("/:id/task/:taskId", verifyAccessToken, getTask);
// router.put("/:id/task/:taskId", verifyAccessToken, updateTask);
router.delete("/task/delete/:taskId", verifyAccessToken, deleteTask);

export default router;
