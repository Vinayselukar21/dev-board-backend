import { Request, Response } from "express";
import { prisma } from "../index";
import { Project, Workspace } from "../types";
import { WorkspaceMember } from "@prisma/client";
import { hashPassword } from "../utils/hash";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import log from "../utils/log";

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
  const { icon, name, description, ownerId } = req.body as Workspace;
  async function createWorkspace() {
    const workspace = await prisma.workspace.create({
      data: {
        icon,
        name,
        description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: "admin",
          },
        },
      },

    });
    return workspace;
  }

  try {
    const workspace = await createWorkspace();
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

export async function updateWorkspace(req: Request, res: Response) {
  res.send("Update Workspace");
}

export async function deleteWorkspace(req: Request, res: Response) {
  res.send("Delete Workspace");
}

export async function getWorkspaces(req: CustomRequest, res: Response) {
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

export async function createProject(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;
  const {
    name,
    description,
    status,
    deadline,
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
        workspace: true,
      },
    });
    return project;
  }

  try {
    const project = await createProject();
    console.log(project, " db error ")
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

export async function addWorkspaceMember(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;
  const { userId, role, departmentId, jobTitle } = req.body;
  async function addWorkspaceMember() {
    const workspaceMember = await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspaceId,
        role,
        departmentId,
        jobTitle,
      },
      include: {
        workspace: true,
        user: true,
      },
    });
    return workspaceMember;
  }

  try {
    const workspaceMember = await addWorkspaceMember();
    log(
      "workspace",
      "addMember",
      `${req?.user?.name} added a new member "${workspaceMember?.user?.name}" to workspace ${workspaceMember?.workspace?.name}.`,
      req.user?.id!,
      workspaceMember?.workspace?.id
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

export async function registerAndAddMember(req: CustomRequest, res: Response) {
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
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });
    return user;
  }

  try {
    const user = await registerAndAddMember();
    log(
      "user",
      "create",
      `${req?.user?.name} added a new user "${user?.name}" to workspace ${user?.memberships[0]?.workspace?.name}.`,
      req.user?.id!,
      user?.memberships[0]?.workspace?.id
    );
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

export async function createDepartment(req: CustomRequest, res: Response) {
  const { name, workspaceId } = req.body;
  async function createDepartment() {
    const department = await prisma.department.create({
      data: {
        name,
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });
    return department;
  }

  try {
    const department = await createDepartment();
    log(
      "workspace",
      "create",
      `${req?.user?.name} created a new department "${department?.name}" in workspace ${department?.workspace?.name}.`,
      req.user?.id!,
      department?.workspace?.id
    );
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

export async function getCalendarEvents(req: CustomRequest, res: Response) {
  const { workspaceId, workspaceMemberId } = req.params;
  async function getCalendarEvents() {
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        workspaceId: workspaceId,
        participants: {
          some:{
            workspaceMemberId: workspaceMemberId,
          }
        },
      },
      include: {
        participants: true,
      },
    });
    return calendarEvents;
  }

  try {
    const calendarEvents = await getCalendarEvents();
    res.status(200).json({
      message: "Calendar events found successfully",
      calendarEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get calendar events",
    });
  }
}

export async function createCalendarEvent(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;
  const {
    title,
    description,
    date,
    time,
    type,
    endTime,
    projectId,
    occurence,
    participants,
    status,
    location,
    createdById,
  } = req.body;
  async function createCalendarEvent() {
    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        date,
        time,
        endTime,
        type,
        workspaceId,
        projectId,
        occurence,
        status,
        location,
        createdById,
        participants: {
          createMany: {
            data: participants.map((id: string) => ({
              workspaceMemberId: id,
            })),
          },
        },
      },
    });
    return calendarEvent;
  }

  try {
    const calendarEvent = await createCalendarEvent();
    log(
      "calendarEvent",
      "create",
      `${req?.user?.name} created a new ${type} "${calendarEvent?.title}" in workspace ${calendarEvent?.workspaceId}.`,
      req.user?.id!,
      calendarEvent?.workspaceId
    );
    res.status(200).json({
      message: "Calendar event created successfully",
      calendarEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create calendar event",
      error,
    });
  }
}


export async function editCalendarEvent(req: CustomRequest, res: Response) {
  const { workspaceId } = req.params;
  const { id, title, description, date, time, type, endTime, projectId, occurence, participants, status, location } = req.body;

  async function editCalendarEvent() {
    const calendarEvent = await prisma.calendarEvent.update({
      where: {
        id: id,
        workspaceId: workspaceId,
      },
      data: {
        title,
        description,
        date,
        time,
        endTime,
        type,
        projectId,
        occurence,
        status,
        location,
        participants: {
          deleteMany: {
            calendarEventId: id,
          },
          createMany: {
            data: participants.map((id: string) => ({
              workspaceMemberId: id,
            })),
          },
        },
      },
    });
    return calendarEvent;
  }

  try {
    const calendarEvent = await editCalendarEvent();
    log(
      "calendarEvent",
      "edit",
      `${req?.user?.name} edited a ${type} "${calendarEvent?.title}" in workspace ${calendarEvent?.workspaceId}.`,
      req.user?.id!,
      calendarEvent?.workspaceId
    );
    res.status(200).json({
      message: "Calendar event edited successfully",
      calendarEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to edit calendar event",
      error,
    });
  }

}

export async function deleteCalendarEvent(req: CustomRequest, res: Response) {
  const { workspaceId , eventId } = req.params;

  async function deleteCalendarEvent() {
    const calendarEvent = await prisma.calendarEvent.delete({
      where: {
        id: eventId,
        workspaceId: workspaceId,
      },
    });
    return calendarEvent;
  }

  try {
    const calendarEvent = await deleteCalendarEvent();
    log(
      "calendarEvent",
      "delete",
      `${req?.user?.name} deleted a ${calendarEvent?.type} "${calendarEvent?.title}" in workspace ${calendarEvent?.workspaceId}.`,
      req.user?.id!,
      calendarEvent?.workspaceId
    );
    res.status(200).json({
      message: "Calendar event deleted successfully",
      calendarEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete calendar event",
      error,
    });
  }
}

export async function cancelCalendarEvent(req: CustomRequest, res:Response){
  const {workspaceId, eventId} = req.params;

  async function cancelCalendarEvent(){
    const calendarEvent = await prisma.calendarEvent.update({
      where: {
        id: eventId,
        workspaceId: workspaceId,
      },
      data: {
        status: "cancelled",
      },
    });
    return calendarEvent;
  }

  try {
    const calendarEvent = await cancelCalendarEvent();
    log(
      "calendarEvent",
      "cancel",
      `${req?.user?.name} cancelled a ${calendarEvent?.type} "${calendarEvent?.title}" in workspace ${calendarEvent?.workspaceId}.`,
      req.user?.id!,
      calendarEvent?.workspaceId
    );
    res.status(200).json({
      message: "Calendar event cancelled successfully",
      calendarEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to cancel calendar event",
      error,
    });
  }
}