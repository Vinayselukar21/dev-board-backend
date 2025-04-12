import Router from "express";
import verifyAccessToken from "../middlewares/verifyAccessToken";
import {
  getMembers,
  addMemberToProject,
  createTaskStage,
  createTask,
  getAllTasksForProject
} from "../controllers/project.controllers";

const router = Router();

// Project Routes
router.post("/addmember", verifyAccessToken, addMemberToProject);
router.get("/:id/members", verifyAccessToken, getMembers);

// Project Tasks Stage Routes
router.post("/newstage", verifyAccessToken, createTaskStage);

// Project Tasks Routes
router.post("/newtask", verifyAccessToken, createTask);
router.get("/:projectId/tasks", verifyAccessToken, getAllTasksForProject);
// router.get("/:id/task/:taskId", verifyAccessToken, getTask);
// router.put("/:id/task/:taskId", verifyAccessToken, updateTask);
// router.delete("/:id/task/:taskId", verifyAccessToken, deleteTask);

export default router;
