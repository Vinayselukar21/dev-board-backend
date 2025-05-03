import { prisma } from "../index";

const log = async (
  type: string,
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
