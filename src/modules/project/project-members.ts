import { prisma } from "../../index";
import log from "../../utils/log";
import { CustomRequest } from "../../middlewares/verifyAccessToken";
import { Request, Response } from "express";
import { PermissionType } from "@prisma/client";

export async function addMemberToProject(req: CustomRequest, res: Response) {
    const { workspacePermissions } = req.user!;
    
    const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === req.params.workspaceId);
    
    if (!workspaceMemberPermissions?.permissions.includes(PermissionType.ADD_MEMBER)) {
      res.status(400).json({ message: "You are not authorized to add members to projects" });
      return
    }
    const { projectId, memberId } = req.body;
    async function addMember() {
      // Add a member to a project
      const res = await prisma.projectMember.create({
        data: {
          projectId,
          memberId,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
          project: true,
        },
      });
      return res;
    }
  
    await addMember()
      .then(async (response) => {
        log(
          "project",
          "create",
          `${req?.user?.name} added ${response?.member?.user?.name} to project "${response?.project?.name}"`,
          req.user?.id!,
          response?.project?.workspaceId
        );
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
  
  export async function getMembers(req: Request, res: Response) {
    res.status(200).json({
      message: "Members found successfully",
    });
  }
  