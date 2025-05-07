import { prisma } from "../index";

const log = async (
  type: "user" | "workspace" | "project" | "task" | "setting" | "calendarEvent",
  action: string,
  message: string,
  userId: string,
  workspaceId: string
) => {
  const log = await prisma.log.create({
    data: {
      type, 
      action,
      message,
      userId,
      workspaceId,
    },
  });
  return log;
};

export default log;
