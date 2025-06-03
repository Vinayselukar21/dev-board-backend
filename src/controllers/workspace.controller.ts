import { Request, Response } from "express";
import { prisma } from "../index";
import { PermissionType, Project, Workspace } from "../types";
import { OrgPermissionType, WorkspaceMember } from "@prisma/client";
import { hashPassword } from "../utils/hash";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import log from "../utils/log";
import { seedWorkspaceDefaultRoles } from "../utils/seed-workspace-default-roles";


export { getCalendarEvents, createCalendarEvent, createCalendarEventSeries, editCalendarEvent, deleteCalendarEvent, cancelCalendarEvent } from "../modules/workspace/calendar"

export { createProject, getWorkspaceProjects, getWorkspaceProjectStats } from "../modules/workspace/projects"

export { createDepartment, getDepartments } from "../modules/workspace/departments"

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
            createdAt: "desc",
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

export async function createWorkspace(req: CustomRequest, res: Response) {

  const { orgPermissions } = req.user!

  if (!orgPermissions.includes(OrgPermissionType.CREATE_WORKSPACE)) {
    res.status(400).json({ message: "You are not authorized to create a workspace" });
    return
  }

  const { icon, name, description, ownerId, organizationId } = req.body as Workspace;

  async function getOwnerRoleId(workspaceId: string) {
    const workspaceRole = await prisma.workspaceRole.findMany({
      where: {
        workspaceId,
      }
    });
    const ownerRole = workspaceRole.find(role => role.name === "Owner");
    return ownerRole?.id;
  }

  async function createWorkspace() {
    const workspace = await prisma.workspace.create({
      data: {
        icon,
        name,
        description,
        ownerId,
        organizationId,
      },

    });
    return workspace;
  }

  async function addOwnerToWorkspace(workspaceId: string) {
    const ownerRoleId = await getOwnerRoleId(workspaceId);
    const workspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        members: {
          create: {
            userId: ownerId,
            roleId: ownerRoleId!,
          },
        },
      },
    });
    return workspace;
  }

  try {
    const workspace = await createWorkspace();
    console.log(workspace, "workspace")
    await seedWorkspaceDefaultRoles(workspace.id, organizationId!);
    await addOwnerToWorkspace(workspace.id);
    log(
      "workspace",
      "create",
      `${req?.user?.name} created a new workspace "${workspace?.name}".`,
      req.user?.id!,
      workspace?.id
    );
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

export async function updateWorkspace(req: CustomRequest, res: Response) {

  const { orgPermissions } = req.user!

  if (!orgPermissions.includes(OrgPermissionType.EDIT_WORKSPACE)) {
    res.status(400).json({ message: "You are not authorized to update a workspace" });
    return
  }

  res.send("Update Workspace");
}

export async function deleteWorkspace(req: CustomRequest, res: Response) {

  const { orgPermissions } = req.user!

  if (!orgPermissions.includes(OrgPermissionType.DELETE_WORKSPACE)) {
    res.status(400).json({ message: "You are not authorized to delete a workspace" });
    return
  }

  res.send("Delete Workspace");
}

export async function getWorkspaces(req: CustomRequest, res: Response) {

  const { orgPermissions } = req.user!

  if (!orgPermissions.includes(OrgPermissionType.VIEW_WORKSPACE)) {
    res.status(400).json({ message: "You are not authorized to view workspaces" });
    return
  }

  async function getWorkspaces() {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: req.user?.id!,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
            role: true,
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

export async function getWorkspaceById(req: CustomRequest, res: Response) {

  const { orgPermissions } = req.user!

  if (!orgPermissions.includes(OrgPermissionType.VIEW_WORKSPACE)) {
    res.status(400).json({ message: "You are not authorized to view workspaces" });
    return
  }

  const { workspaceId } = req.params;
  async function getWorkspaceById() {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          include: {
            user: true,
            role: true,
          },
        },
        projects: {
          include: {
            members: {
              include: {
                member: {
                  include: {
                    user: true,
                    role: true,
                  },
                },
              },
            },
            taskStages: true,
          },
        },
        departments: true,
        logs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },
        calendarEvents: true,
        roles: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
            members: true,
          },
        },
        organization: true,
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

export async function addWorkspaceMember(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;

  const {workspacePermissions} =req.user!

  const currentWorkspaceRole = workspacePermissions.find((permission) => permission.workspaceId === workspaceId)

  if (!currentWorkspaceRole?.permissions.includes(PermissionType.ADD_MEMBER)) {
    res.status(400).json({ message: "You are not authorized to add a member to this workspace" });
    return
  }

  const { userIds, roleId, departmentId } = req.body;
  async function addWorkspaceMember() {
    const workspaceMember = await prisma.workspaceMember.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        workspaceId,
        roleId,
        departmentId,
      })),
      skipDuplicates: true,
    });
    return workspaceMember;
  }

  async function getWorkspaceMember() {
    const workspaceMember = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: true,
        workspace: true,
      },
    });
    return workspaceMember;
  }

  try {
    const workspaceMember = await addWorkspaceMember();
    const workspaceMemberData = await getWorkspaceMember();
    log(
      "workspace",
      "addMember",
      `${req?.user?.name} added a new member "${workspaceMemberData.map((member) => member.user.name).join(", ")}" to workspace ${workspaceMemberData[0]?.workspace?.name}.`,
      req.user?.id!,
      workspaceMemberData[0]?.workspace?.id
    );
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
        role: true
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

export async function getWorkspaceSettings(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;

  // async function getWorkspaceSettings(){
  //   const workspaceSettings = await prisma.workspaceSettings.findUnique({
  //     where: {
  //       workspaceId: workspaceId,
  //     },
  //   });
  //   return workspaceSettings;
  // }



  try {
    // const workspaceSettings = await getWorkspaceSettings();
    res.status(200).json({
      message: "Workspace settings found successfully",
      // workspaceSettings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get workspace settings",
    });
  }
}

export async function createCustomWorkspaceRole(req: CustomRequest, res: Response) {

  const { workspacePermissions } = req.user!

  const currentWorkspaceRole = workspacePermissions.find((permission) => permission.workspaceId === workspaceId)

  if (!currentWorkspaceRole?.permissions.includes(PermissionType.CREATE_CUSTOM_WORKSPACE_ROLE)) {
    res.status(400).json({ message: "You are not authorized to create a custom workspace role" });
    return
  }

  const { name, description, permissions, workspaceId } = req.body;
  try {
    const role = await prisma.workspaceRole.create({
      data: {
        name,
        description,
        permissions: {
          createMany: {
            data: permissions.map((permissionId: string) => ({
              workspacePermissionId: permissionId,
            })),
          },
        },
        workspaceId,
      },
    });
    res.status(200).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return
  }
}