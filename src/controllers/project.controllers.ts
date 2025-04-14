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
            tasks: true,
          },
        },
        members: {
          include:{
            member: {
              include:{
                user: true
              }
            }
          }
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

// MEMBER RELATED //-------------------------------------------------------------------------------------
export async function addMemberToProject(req: Request, res: Response) {
  const { projectId, memberId } = req.body;
  async function addMember() {
    // Add a member to a project
    const res = await prisma.projectMember.create({
      data: {
        projectId,
        memberId,
      },
    });
    return res;
  }

  await addMember()
    .then(async (response) => {
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
export async function createTaskStage(req: Request, res: Response) {
  const { projectId, name } = req.body;
  async function createTaskStage() {
    const taskStage = await prisma.taskStage.create({
      data: {
        projectId,
        name,
      },
    });
    return taskStage;
  }

  try {
    const taskStage = await createTaskStage();
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

export async function createTask(req: Request, res: Response) {
  const {
    projectId,
    title,
    description,
    status,
    priority,
    dueDate,
    stageId,
    createdById,
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
      },
    });
    return task;
  }

  try {
    const task = await createTask();
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

export async function getAllTasksForProject(req: Request, res: Response) {
  const { projectId } = req.params;
  async function tasksByStage() {
    const tasks = await prisma.taskStage.findMany({
      where: {
        projectId,
      },
      include: {
        tasks: true,
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

export async function changeTaskStage(req: Request, res: Response){
  const { taskId, stageId } = req.body;
  async function changeTaskStage() {
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        stageId,
      },
    });
    return task;
  }

  try {
    const task = await changeTaskStage();
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

export async function deleteTask(req: Request, res: Response) {
  const { taskId } = req.params;

  async function deleteTask() {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
    return task;
  }

  try {
    const task = await deleteTask();
    res.status(200)
      .json({
        message: "Task deleted successfully",
        task,
      });
  } catch (error) {
    console.error(error);
    res.status(500)
      .json({
        message: "Failed to delete task",
      });
  }
}
