import { prisma } from "../../index";
import log from "../../utils/log";
import { CustomRequest } from "../../middlewares/verifyAccessToken";
import { Response } from "express";
import { PermissionType } from "../../types";

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
        data:taskStage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create task stage",
        error: error || "Something went wrong",
      });
    }
  }
  
  export async function createTask(req: CustomRequest, res: Response) {

    const { workspacePermissions } = req.user!;
    
        const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
    
        if (!workspaceMemberPermissions?.permissions.includes(PermissionType.TASK_CREATE)) {
          res.status(400).json({ message: "You are not authorized to create tasks" });
          return
        }

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
        data:task,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create task",
        error: error || "Something went wrong",
      });
    }
  }
  
  export async function updateTask(req: CustomRequest, res: Response) {
    const { taskId, title, description, status, priority, dueDate, stageId, assignees } = req.body;
    
    const { workspacePermissions } = req.user!;
    
        const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
    
        if (!workspaceMemberPermissions?.permissions.includes(PermissionType.TASK_EDIT)) {
          res.status(400).json({ message: "You are not authorized to update tasks" });
          return
        }

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
        data:task,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update task",
        error: error || "Something went wrong",
      });
    }
  }
  
  export async function getAllTasksForProject(req: CustomRequest, res: Response) {
    const { workspacePermissions } = req.user!;
    
    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
    
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.TASK_VIEW)) {
      res.status(400).json({ message: "You are not authorized to view tasks" });
      return
    }
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
        data:tasks,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to get tasks by stage",
        error: error || "Something went wrong",
      });
    }
  }
  
  export async function changeTaskStage(req: CustomRequest, res: Response) {
    const { taskId, stageId } = req.body;
    
    const { workspacePermissions } = req.user!;
    
        const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
    
        if (!workspaceMemberPermissions?.permissions.includes(PermissionType.TASK_EDIT)) {
          res.status(400).json({ message: "You are not authorized to update tasks" });
          return
        }

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
        data:task,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to change task stage",
        error: error || "Something went wrong",
      });
    }
  }
  
  export async function deleteTask(req: CustomRequest, res: Response) {
    const { taskId } = req.params;
    
    const { workspacePermissions } = req.user!;
    
        const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
    
        if (!workspaceMemberPermissions?.permissions.includes(PermissionType.TASK_DELETE)) {
          res.status(400).json({ message: "You are not authorized to delete tasks" });
          return
        }
  
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
        data:task,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to delete task",
        error: error || "Something went wrong",
      });
    }
  }
  