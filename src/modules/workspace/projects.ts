
import { prisma } from "../../index";
import log from "../../utils/log";
import { Request, Response } from "express";
import { CustomRequest } from "../../middlewares/verifyAccessToken";
import { PermissionType } from "../../types";

export async function createProject(req: CustomRequest, res: Response) {
   const { workspacePermissions } = req.user!;
  
      const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
      if (!workspaceMemberPermissions?.permissions.includes(PermissionType.PROJECT_CREATE)) {
        res.status(400).json({ message: "You are not authorized to create a project" });
        return
      }
    const { workspaceId } = req.params;
    const {
      name,
      description,
      status,
      deadline,
      createdById,
      members,
      organizationId
    } = req.body;
    async function createProject() {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          status,
          deadline,
          workspaceId,
          createdById,
          members: members
            ? {
              create: members.map((memberId: string) => ({
                memberId: memberId,
              })),
            }
            : undefined,
        },
        include: {
          members: true,
          workspace: true,
        },
      });
      return project;
    }
  
    try {
      const project = await createProject();
      log(
        "project",
        "create",
        `${req?.user?.name} created a new project "${project?.name}" in workspace ${project?.workspace?.name}.`,
        req.user?.id!,
        project?.workspace?.id
      );
      res.status(200).json({
        message: "Project created successfully",
        project,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create project",
      });
    }
  }
  
  export async function getWorkspaceProjects(req: CustomRequest, res: Response) {
    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);

    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.PROJECT_VIEW)) {
      res.status(400).json({ message: "You are not authorized to view projects" });
      return
    }
    const { workspaceId, workspaceMemberId } = req.params;
    async function getWorkspaceProjects() {
      const projects = await prisma.project.findMany({
        where: {
          workspaceId: workspaceId,
          members: {
            some: {
              memberId: workspaceMemberId,
            },
          },
        },
      });
      return projects;
    }
  
    try {
      const projects = await getWorkspaceProjects();
      res.status(200).json({
        message: "Projects found successfully",
        projects,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to get workspace projects",
      });
    }
  }
  
  export async function getWorkspaceProjectStats(req: CustomRequest, res: Response) {
    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);

    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.PROJECT_VIEW)) {
      res.status(400).json({ message: "You are not authorized to view projects" });
      return
    }
    const { workspaceId, workspaceMemberId } = req.params;
    async function getWorkspaceProjectStats() {
      const projects = await prisma.project.findMany({
        where: {
          workspaceId: workspaceId,
          members: {
            some: {
              memberId: workspaceMemberId,
            },
          },
        },
        include: {
          members: true,
          taskStages: {
            include: {
              tasks: true
            }
          }
        }
      });
      return projects;
    }
  
    try {
      const projects = await getWorkspaceProjectStats();
      const statsMap = projects ? projects.reduce((acc, { id, ...project }) => {
        acc[id] = {
          projectStatus: project.status,
          membersCount: project.members.length,
          taskStages: project.taskStages.map((stage) => ({
            id: stage.id,
            name: stage.name,
            createdAt: stage.createdAt,
            updatedAt: stage.updatedAt,
            tasksCount: stage.tasks.length,
          }))
        };
        return acc;
      }, {} as Record<string, any>) : [];
      res.status(200).json({
        message: "Project stats found successfully",
        statsMap,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to get workspace project stats",
      });
    }
  }