import { Request, Response } from "express";
import { prisma } from "../index";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import log from "../utils/log";
import { hashPassword } from "../utils/hash";

export async function getMyOrganization(req: CustomRequest, res: Response) {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                ownerId: req?.user?.id!,
            },
            include: {
                owner: true,
                users: {
                    include: {
                       memberships: {
                        include: {
                            workspace: true,
                        },
                       },
                    },
                },
                workspaces: {
                    include: {
                        members: {
                            include: {
                                user: true,
                            },
                        },
                        projects: {
                            include: {
                                members: {
                                    include:{
                                        member:{
                                            include:{
                                                user: true,
                                            }
                                        }
                                    }
                                }
                            },
                        },
                        departments: true,
                    },
                },
            },
        });
        if (!organization) {
           res.status(404).json({ message: "Organization not found" });
           return
        }
        res.status(200).json({
            message: "Organization found successfully",
            organization,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
}

export async function createOrganization(req: CustomRequest, res: Response) {
    const { name, type } = req.body;
    try {
        const organization = await prisma.organization.create({
            data: {
                name,
                ownerId: req.user?.id!,
                type,
                users: {
                    connect: {
                        id: req.user?.id!,
                    },
                },
            },
        });
        res.status(200).json({
            message: "Organization created successfully",
            organization,
          });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return
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
    organizationId,
    jobTitle,
    designation,
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
        jobTitle,
        designation,
        memberships: workspaceId ? {
          create: {
            workspaceId,
            role,
            departmentId,
            organizationId,
          },
        } : undefined,
        organizationId,
      },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
        organization: true,
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