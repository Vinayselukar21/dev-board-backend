import { Request, Response } from "express";
import { prisma } from "../index";
// PROJECT ----------------------------------------------------------------------------------------------
export async function getProjectById(req: Request, res: Response) {
  const { projectId } = req.params;
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

export async function getProjectLogs(req: Request, res: Response) {
  const { workspaceId } = req.params;
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
