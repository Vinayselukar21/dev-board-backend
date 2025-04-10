import { Request, Response } from "express";
import { prisma } from "../index";
import { Project, Workspace } from "../types";

export async function createWorkspace(req: Request, res: Response) {
  const { name, description, ownerId } = req.body as Workspace;
  async function createWorkspace() {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        ownerId,
      },
    });
    return workspace;
  }

  try {
    const workspace = await createWorkspace();
    res.status(200).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create workspace",
    });
  }
}

export async function updateWorkspace(req: Request, res: Response) {
  res.send("Update Workspace");
}

export async function deleteWorkspace(req: Request, res: Response) {
  res.send("Delete Workspace");
}

export async function getWorkspaces(req: Request, res: Response) {
  const { id } = req.params;
  async function getWorkspaces() {
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: id,
      },
    });
    return workspaces;
  }

  try {
    const workspaces = await getWorkspaces();
    res.status(200).json({
      message: "Workspaces found successfully",
      workspaces,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get user workspaces",
    });
  }
}

export async function getWorkspaceById(req: Request, res: Response) {
  const { id } = req.params;
  async function getWorkspaceById() {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: id,
      },
    });
    return workspace;
  }

  try {
    const workspace = await getWorkspaceById();
    res.status(200).json({
      message: "Workspace found successfully",
      workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get workspace by id",
    });
  }
}

export async function createProject(req: Request, res: Response) {
  const { name, description, status, deadline, workspaceId, createdById } =
    req.body as Project;
  async function createProject() {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        deadline,
        workspaceId,
        createdById,
      },
    });
    return project;
  }

  try {
    const project = await createProject();
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

export async function getWorkspaceProjects(req: Request, res: Response) {
  const { id } = req.params;
  async function getWorkspaceProjects() {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId: id,
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
