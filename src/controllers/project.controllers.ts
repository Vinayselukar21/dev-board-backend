import { Request, Response } from "express";
import { prisma } from "../index";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import log from "../utils/log";
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
export async function addMemberToProject(req: CustomRequest, res: Response) {
  const { projectId, memberId } = req.body;
  async function addMember() {
    // Add a member to a project
    const res = await prisma.projectMember.create({
      data: {
        projectId,
        memberId,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });
    return res;
  }

  await addMember()
    .then(async (response) => {
      log(
        "project",
        "create",
        `${req?.user?.name} added ${response?.member?.user?.name} to project "${response?.project?.name}"`,
        req.user?.id!,
        response?.project?.workspaceId
      );
      res.status(200).json({
        message: "Member added to project successfully",
        response,
      });
    })
    .catch(async (e) => {
      console.error(e);
      res.status(500).json({ message: "Failed to add member to project" });
      return;
    });
}

export async function getMembers(req: Request, res: Response) {}

// TASK RELATED //-------------------------------------------------------------------------------------
export async function createTaskStage(req: CustomRequest, res: Response) {
  const { projectId, name } = req.body;
  async function createTaskStage() {
    const taskStage = await prisma.taskStage.create({
      data: {
        projectId,
        name,
      },
      include: {
        project: true,
      },
    });
    return taskStage;
  }

  try {
    const taskStage = await createTaskStage();
    log(
      "task",
      "create",
      `${req?.user?.name} created a new task stage "${taskStage?.name}" in project ${taskStage?.project?.name}.`,
      req.user?.id!,
      taskStage?.project?.workspaceId
    );
    res.status(200).json({
      message: "Task stage created successfully",
      taskStage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create task stage",
    });
  }
}

export async function createTask(req: CustomRequest, res: Response) {
  const {
    projectId,
    title,
    description,
    status,
    priority,
    dueDate,
    stageId,
    createdById,
    assignees,
  } = req.body;
  async function createTask() {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate,
        projectId,
        stageId,
        createdById,
        assignees: {
          connect: assignees.map((id: string) => ({
            id,
          })),
        },
      },
      include: {
        project: true,
      },
    });
    return task;
  }

  try {
    const task = await createTask();
    log(
      "task",
      "create",
      `${req?.user?.name} created a new task "${task?.title}" in project ${task?.project?.name}.`,
      req.user?.id!,
      task?.project?.workspaceId
    );
    res.status(200).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create task",
    });
  }
}

export async function updateTask(req: CustomRequest, res: Response) {
  const { taskId, title, description, status, priority, dueDate, stageId, assignees } = req.body;
  async function updateTask() {
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        status,
        priority,
        dueDate,
        stageId,
        assignees: {
          set: assignees.map((id: string) => ({
            id,
          })),
        },
      },
      include: {
        project: true,
      },
    });
    return task;
  }

  try {
    const task = await updateTask();
    log(
      "task",
      "update",
      `${req?.user?.name} updated a task "${task?.title}" in project ${task?.project?.name}.`,
      req.user?.id!,
      task?.project?.workspaceId
    );
    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update task",
    });
  }
}

export async function getAllTasksForProject(req: Request, res: Response) {
  const { projectId } = req.params;
  async function tasksByStage() {
    const tasks = await prisma.taskStage.findMany({
      where: {
        projectId,
      },
      include: {
        tasks: {
          include: {
            assignees: true,
          }
        },
      },
    });
    return tasks;
  }

  try {
    const tasks = await tasksByStage();
    res.status(200).json({
      message: "Tasks found successfully",
      tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get tasks by stage",
    });
  }
}

export async function changeTaskStage(req: CustomRequest, res: Response) {
  const { taskId, stageId } = req.body;
  async function changeTaskStage() {
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        stageId,
      },
      include: {
        stage: true,
        project: true,
      },
    });
    return task;
  }

  try {
    const task = await changeTaskStage();
    log(
      "task",
      "update",
      `${req?.user?.name} moved task "${task?.title}" to ${task?.stage?.name} in project ${task?.project?.name}.`,
      req.user?.id!,
      task?.project?.workspaceId
    );
    res.status(200).json({
      message: "Task stage changed successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to change task stage",
    });
  }
}

export async function deleteTask(req: CustomRequest, res: Response) {
  const { taskId } = req.params;

  async function deleteTask() {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
      },
      include: {
        project: true,
      },
    });
    return task;
  }

  try {
    const task = await deleteTask();
    log(
      "task",
      "delete",
      `${req?.user?.name} deleted a task "${task?.title}" in project ${task?.project?.name}.`,
      req.user?.id!,
      task?.project?.workspaceId
    );
    res.status(200).json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
}
