import { Request, Response } from "express";
import { prisma } from "../index";
import { Project, Workspace } from "../types";
import { WorkspaceMember } from "@prisma/client";
import { hashPassword } from "../utils/hash";

export async function workspaceDashboard(req: Request, res: Response) {
  const { workspaceId } = req.params;
  async function workspaceDashboard() {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          include: {
            user: true,
            department: true,
          },
        },
        owner: true,
        projects: {
          include: {
            tasks: {
              include: {
                stage: true,
              },
            },
            taskStages: {
              include: {
                tasks: true,
              },
            },
          },
        },
        departments: true,
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
      },
    });
    return workspace;
  }

  try {
    const workspace = await workspaceDashboard();

    const getProjectProgress = (project: any) => {
      const totalTasks = project.tasks.length;
      let taskStatusCount: { [key: string]: number } = {};

      totalTasks &&
        project.tasks.forEach((task: any) => {
          const status = task.stage.name;
          taskStatusCount[status] = (taskStatusCount[status] || 0) + 1;
        });

      const completedTasks = taskStatusCount["Done"] || 0;
      return {
        totalTasks: totalTasks || 0,
        percentage: ((completedTasks / totalTasks) * 100 || 0).toFixed(1),
        taskStatusCount,
      };
    };

    const dashboardObject = {
      projectCard: {
        count: workspace
          ? workspace.projects
            ? workspace.projects.length
            : 0
          : 0,
      },

      taskCard: {
        completedTaskCount: workspace
          ? workspace.projects
            ? workspace.projects
                .map(
                  (project) =>
                    project.tasks.filter((task) => task.stage.name === "Done")
                      .length
                )
                .reduce((a, b) => a + b, 0)
            : 0
          : 0,
        totalTaskCount: workspace
          ? workspace.projects
            ? workspace.projects
                .map((project) => project.tasks.length)
                .reduce((a, b) => a + b, 0)
            : 0
          : 0,
      },

      teamCard: {
        count: workspace
          ? workspace.members
            ? workspace.members.length
            : 0
          : 0,
      },

      projectProgressCard: workspace
        ? workspace.projects
          ? workspace.projects.map((project) => {
              return {
                id: project.id,
                name: project.name,
                progress: getProjectProgress(project),
              };
            })
          : []
        : [],

      taskDistributionCard: {},

      logsCard: workspace?.logs,
    };
    res.status(200).json({
      message: "Workspace dashboard found successfully",
      dashboard: dashboardObject,
      workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get workspace dashboard",
    });
  }
}

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
  const { ownerId } = req.params;
  async function getWorkspaces() {
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: ownerId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        projects: true,
        departments: true,
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
  const { workspaceId } = req.params;
  async function getWorkspaceById() {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
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
  const {
    name,
    description,
    status,
    deadline,
    workspaceId,
    createdById,
    members,
  } = req.body as Project;
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
  const { workspaceId } = req.params;
  async function getWorkspaceProjects() {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
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

export async function addWorkspaceMember(req: Request, res: Response) {
  const { workspaceId } = req.params;
  const { userId, role, departmentId } = req.body;
  async function addWorkspaceMember() {
    const workspaceMember = await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspaceId,
        role,
        departmentId,
      },
    });
    return workspaceMember;
  }

  try {
    const workspaceMember = await addWorkspaceMember();
    res.status(200).json({
      message: "Workspace member added successfully",
      workspaceMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add workspace member",
    });
  }
}

export async function registerAndAddMember(req: Request, res: Response) {
  const {
    name,
    email,
    password,
    role,
    workspaceId,
    departmentId,
    contactNo,
    location,
  } = req.body;
  const hashedPassword = await hashPassword(password);

  async function registerAndAddMember() {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
        contactNo,
        location,
        memberships: {
          create: {
            workspaceId,
            role,
            departmentId,
          },
        },
      },
    });
    return user;
  }

  try {
    const user = await registerAndAddMember();
    res.status(200).json({
      message: "User registered and added to workspace successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to register and add user to workspace",
    });
  }
}

export async function getWorkspaceMembers(req: Request, res: Response) {
  const { workspaceId } = req.params;
  async function getWorkspaceMembers() {
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: true,
        department: true,
        projects: {
          include: {
            project: true,
          },
        },
      },
    });
    return members;
  }

  try {
    const members = await getWorkspaceMembers();
    // const memberDetails = await getMemeberDetails(members);
    res.status(200).json({
      message: "Members found successfully",
      members,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get workspace members",
    });
  }
}

export async function getWorkspaceMemberById(req: Request, res: Response) {
  const { workspaceId, memberId } = req.params;
  async function getMember() {
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
        workspaceId: workspaceId,
      },
      include: {
        user: true,
        department: true,
        projects: {
          include: {
            project: true,
          },
        },
      },
    });
    return workspaceMember;
  }

  try {
    const workspaceMember = await getMember();
    res.status(200).json({
      message: "Workspace member found successfully",
      workspaceMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get workspace member by id",
    });
  }
}

export async function createDepartment(req: Request, res: Response) {
  const { name, workspaceId } = req.body;
  async function createDepartment() {
    const department = await prisma.department.create({
      data: {
        name,
        workspaceId,
      },
    });
    return department;
  }

  try {
    const department = await createDepartment();
    res.status(200).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create department",
    });
  }
}

export async function getDepartments(req: Request, res: Response) {
  const { workspaceId } = req.params;
  async function getDepartments() {
    const departments = await prisma.department.findMany({
      where: {
        workspaceId: workspaceId,
      },
    });
    return departments;
  }

  try {
    const departments = await getDepartments();
    res.status(200).json({
      message: "Departments found successfully",
      departments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get departments",
    });
  }
}
