import { CustomRequest } from "../../middlewares/verifyAccessToken";
import { prisma } from "../../index";
import log from "../../utils/log";
import { Response } from "express";
import { PermissionType } from "../../types";


export async function getCalendarEvents(req: CustomRequest, res: Response) {

    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);

    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EVENT_VIEW)) {
      res.status(400).json({ message: "You are not authorized to view calendar events" });
      return
    }
    const { workspaceId, workspaceMemberId, month, year } = req.params;
    async function getCalendarEvents() {
      // JS months are 0-based, so month - 1
      const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
      const endDate = new Date(Date.UTC(Number(year), Number(month), 1)); // First day of next month
  
      const calendarEvents = await prisma.calendarEvent.findMany({
        where: {
          workspaceId: workspaceId,
          participants: {
            some: {
              workspaceMemberId: workspaceMemberId,
            },
          },
        },
        include: {
          participants: true,
          series: true,
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

    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EVENT_CREATE)) {
      res.status(400).json({ message: "You are not authorized to create calendar events" });
      return
    }

    const { workspaceId } = req.params;
    const {
      title,
      description,
      date,
      time,
      type,
      endTime,
      projectId,
      occurrence,
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
          occurrence,
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
  
  export async function createCalendarEventSeries(req: CustomRequest, res: Response) {

    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EVENT_CREATE)) {
      res.status(400).json({ message: "You are not authorized to create calendar events" });
      return
    }

    const { workspaceId } = req.params;
    const { occurrence, participants, seriesTitle, seriesDescription, seriesStartDate, seriesEndDate, repeatEvery, repeatFor } = req.body;
  
    async function createCalendarEventSeries() {
      const calendarEventSeries = await prisma.calendarEventSeries.create({
        data: {
          seriesTitle,
          seriesDescription,
          workspaceId,
          seriesStartDate,
          seriesEndDate,
          repeatEvery,
          repeatFor,
        }
      })
      return calendarEventSeries;
    }
  
    async function createCalendarEvents(calendarEventSeriesId: string) {
      for (const occ of occurrence) {
        const calendarEvent = await prisma.calendarEvent.create({
          data: {
            title: occ.title,
            description: occ.description,
            date: occ.date,
            time: occ.time,
            endTime: occ.endTime,
            type: occ.type,
            workspaceId: workspaceId,
            projectId: occ.projectId,
            occurrence: occ.occurrence,
            status: occ.status,
            location: occ.location,
            createdById: occ.createdById,
            seriesId: calendarEventSeriesId,
            participants: {
              createMany: {
                data: participants.map((id: string) => ({
                  workspaceMemberId: id,
                })),
              },
            },
          },
        });
      }
    }
  
    try {
      const calendarEventSeries = await createCalendarEventSeries();
      await createCalendarEvents(calendarEventSeries.id);
      res.status(200).json({
        message: "Calendar event series created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create calendar event series",
        error,
      });
    }
  }
  
  // export async function editCalendarEventSeries(req: CustomRequest, res: Response) {

  // const { workspacePermissions } = req.user!;

  //   const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
  //   if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EDIT_EVENT || PermissionType.EDIT_ANY_EVENT)) {
  //     res.status(400).json({ message: "You are not authorized to edit calendar events" });
  //     return
  //   }

  //   const { workspaceId } = req.params;
  //   const { seriesId, seriesTitle, seriesDescription, seriesStartDate, seriesEndDate, repeatEvery, repeatFor } = req.body;
  
  //   async function getCalendarEvents() {
  //     const calendarEvents = await prisma.calendarEvent.findMany({
  //       where: {
  //         seriesId: seriesId,
  //       },
  //     });
  //     return calendarEvents;
  //   }
  
  //   async function editCalendarEventSeries() {
  //     const calendarEvents = await getCalendarEvents();
  //     const calendarEventSeries = await prisma.calendarEventSeries.update({
  //       where: {
  //         id: seriesId,
  //         workspaceId: workspaceId,
  //       },
  //       data: {
  //         seriesTitle,
  //         seriesDescription,
  //         seriesStartDate,
  //         seriesEndDate,
  //         repeatEvery,
  //         repeatFor,
  //       },
  //     });
  //     return calendarEventSeries;
  //   }
  
  //   try {
  //     const calendarEventSeries = await editCalendarEventSeries();
  //     res.status(200).json({
  //       message: "Calendar event series edited successfully",
  //       calendarEventSeries,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({
  //       message: "Failed to edit calendar event series",
  //       error,
  //     });
  //   }
  // }
  
  export async function editCalendarEvent(req: CustomRequest, res: Response) {

    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EVENT_EDIT)) {
      res.status(400).json({ message: "You are not authorized to edit calendar events" });
      return
    }

    const { workspaceId } = req.params;
    const { id, title, description, date, time, type, endTime, projectId, occurrence, participants, status, location } = req.body;
  
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
          occurrence,
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

    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EVENT_DELETE)) {
      res.status(400).json({ message: "You are not authorized to delete calendar events" });
      return
    }

    const { workspaceId, eventId } = req.params;
  
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
  
  export async function cancelCalendarEvent(req: CustomRequest, res: Response) {

    const { workspacePermissions } = req.user!;

    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
  
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.EVENT_CANCEL)) {
      res.status(400).json({ message: "You are not authorized to cancel calendar events" });
      return
    }
    const { workspaceId, eventId } = req.params;
  
    async function cancelCalendarEvent() {
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