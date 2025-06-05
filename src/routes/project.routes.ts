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
  getProjectLogs,
  updateTask
} from "../controllers/project.controllers";

const router = Router();

// Get project logs
router.get("/:workspaceId/logs", verifyAccessToken, getProjectLogs);

// Get project details by id 
router.get("/:workspaceId/getbyid/:projectId", verifyAccessToken, getProjectById); // fetch a project by id 

// Project Routes
router.post("/:workspaceId/addmember", verifyAccessToken, addMemberToProject);
router.get("/:id/members", verifyAccessToken, getMembers);

// Project Tasks Stage Routes
router.post("/newstage", verifyAccessToken, createTaskStage);

// Project Tasks Routes
router.post("/:workspaceId/newtask", verifyAccessToken, createTask);
router.put("/:workspaceId/updatetask", verifyAccessToken, updateTask);

router.get("/:workspaceId/:projectId/tasks", verifyAccessToken, getAllTasksForProject); // not in use
router.put("/:workspaceId/taskstagechange", verifyAccessToken, changeTaskStage);
// router.get("/:id/task/:taskId", verifyAccessToken, getTask);
// router.put("/:id/task/:taskId", verifyAccessToken, updateTask);
router.delete("/:workspaceId/task/delete/:taskId", verifyAccessToken, deleteTask);

export default router;
