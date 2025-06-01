import { Router } from "express";
import {
  addWorkspaceMember,
  createDepartment,
  createCalendarEvent,
  getCalendarEvents,
  // Workspace Projects Related
  createProject,
  // Workspace Related
  createWorkspace,
  getDepartments,
  getWorkspaceById,
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaces,
  // registerAndAddMember,
  workspaceDashboard,
  editCalendarEvent,
  deleteCalendarEvent,
  cancelCalendarEvent,
  getWorkspaceSettings,
  createCustomWorkspaceRole,
  getWorkspaceProjectStats,
  createCalendarEventSeries
} from "../controllers/workspace.controller";
import verifyAccessToken from "../middlewares/verifyAccessToken";

const router = Router();

// Workspace Routes
router.get("/:workspaceId/dashboard", verifyAccessToken, workspaceDashboard); // fetch workspace dashboard (includes logs)

router.post("/create", verifyAccessToken, createWorkspace); // create a new workspace - done
// router.put("/update/:id", verifyAccessToken, updateWorkspace); // update a workspace
// router.delete("/delete/:id", verifyAccessToken, deleteWorkspace); // delete a workspace
router.get("/getall/:ownerId", verifyAccessToken, getWorkspaces); // fetch workspaces -done
router.get("/getbyid/:workspaceId", verifyAccessToken, getWorkspaceById); // fetch a workspace by id

// Workspace Projects Routes
router.post("/:workspaceId/newproject", verifyAccessToken, createProject); // create a new project
router.get("/:workspaceId/:workspaceMemberId/projects/getall", verifyAccessToken, getWorkspaceProjects); // fetch all projects in a workspace
router.get("/:workspaceId/:workspaceMemberId/projects/getall/stats", verifyAccessToken, getWorkspaceProjectStats); // fetch all projects in a workspace

// Workspace Member Routes
router.post("/:workspaceId/addmember", verifyAccessToken, addWorkspaceMember); // add a new member to a workspace
router.get("/:workspaceId/members", verifyAccessToken, getWorkspaceMembers); // fetch all members in a workspace

// Owener registers a user and add new member to workspace
// router.post("/registerandaddmember", verifyAccessToken, registerAndAddMember);

// Settings Routes
router.get("/:workspaceId/settings", verifyAccessToken, getWorkspaceSettings);

// Department Routes
router.post("/newdepartment", verifyAccessToken, createDepartment); // create a new department
router.get("/:workspaceId/getall", verifyAccessToken, getDepartments); // fetch all departments in a workspace

// Calendar Event Routes
router.post("/:workspaceId/newevent", verifyAccessToken, createCalendarEvent); // create a new calendar event
router.post("/:workspaceId/neweventseries", verifyAccessToken, createCalendarEventSeries); // create a new calendar event series
router.get("/:workspaceId/:workspaceMemberId/events/getall/:month/:year", verifyAccessToken, getCalendarEvents); // fetch all calendar events in a workspace
router.put("/:workspaceId/event/update", verifyAccessToken, editCalendarEvent); // edit a calendar event
router.delete("/:workspaceId/events/delete/:eventId", verifyAccessToken, deleteCalendarEvent); // delete a calendar event
router.put("/:workspaceId/events/cancel/:eventId", verifyAccessToken, cancelCalendarEvent); // cancel a calendar event

// Workspace Role Routes
router.post("/new/customrole", verifyAccessToken, createCustomWorkspaceRole)

export default router;
