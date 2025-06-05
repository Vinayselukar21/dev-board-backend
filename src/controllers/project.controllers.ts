import { Request, Response } from "express";
import { prisma } from "../index";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import { PermissionType } from "../types";
// PROJECT ----------------------------------------------------------------------------------------------
export async function getProjectById(req: CustomRequest, res: Response) {
  const {workspaceId, projectId } = req.params;

  const { workspacePermissions } = req.user!;
  
      const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === workspaceId);
  
      if (!workspaceMemberPermissions?.permissions.includes(PermissionType.VIEW_PROJECT || PermissionType.ALL_PROJECT)) {
        res.status(400).json({ message: "You are not authorized to view projects" });
        return
      }

  async function getProjectById() {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        taskStages: {
          include: {
            tasks: {
              include: {
                assignees: true,
              },
            },
          },
        },
        createdBy: true,
        members: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return project;
  }

  try {
    const project = await getProjectById();
    res.status(200).json({
      message: "Project found successfully",
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get project by id",
    });
  }
}

export async function getProjectLogs(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;

  const { workspacePermissions } = req.user!;
  
      const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === workspaceId);
  
      if (!workspaceMemberPermissions?.permissions.includes(PermissionType.VIEW_PROJECT || PermissionType.ALL_PROJECT)) {
        res.status(400).json({ message: "You are not authorized to view projects" });
        return
      }

  async function getProjectLogs() {
    const logs = await prisma.log.findMany({
      where: {
        workspaceId: workspaceId,
        type: {
          in: ["project", "task"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
    return logs;
  }

  try {
    const logs = await getProjectLogs();
    res.status(200).json({
      message: "Logs found successfully",
      logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get project logs",
    });
  }
}

// MEMBER RELATED //-------------------------------------------------------------------------------------
export { addMemberToProject, getMembers } from "../modules/project/project-members";
// TASK RELATED //-------------------------------------------------------------------------------------
export { changeTaskStage, createTask, createTaskStage, deleteTask, getAllTasksForProject, updateTask } from "../modules/project/tasks";
