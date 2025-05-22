import { Request, Response } from "express";
import { prisma } from "../index";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import log from "../utils/log";
import { hashPassword } from "../utils/hash";
import { seedOrganizationDefaultRoles } from "../utils/seed-organization-default-roles";
import { User } from "../types";

export async function getMyOrganization(req: CustomRequest, res: Response) {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                ownerId: req?.user?.id!,
            },
            include: {
                owner: {
                    include: {
                        organizationRole: true,
                        memberships: {
                            include: {
                                workspace: true,
                                role: true,
                            },
                        },
                    },
                },
                users: {
                    include: {
                       memberships: {
                        include: {
                            workspace: true,
                            role: true,
                        },
                       },
                       organizationRole: true,
                    },
                },
                workspaces: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    include: {
                                        organizationRole: true,
                                    },
                                },
                                role: true,
                            },
                        },
                        projects: {
                            include: {
                                members: {
                                    include:{
                                        member:{
                                            include:{
                                                user: {
                                                    include: {
                                                        organizationRole: true,
                                                    },
                                                },
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

        await seedOrganizationDefaultRoles(organization.id);

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
    roleId,
    workspaceId,
    departmentId,
    contactNo,
    location,
    organizationId,
    jobTitle,
    designation,
    organizationRoleId,
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
            ...(departmentId && { departmentId }),
            organizationId,
            roleId,
          },
        } : undefined,
        organizationId,
        organizationRoleId,
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


// Fetch all roles and permissions list
export async function getAllRoles(req: CustomRequest, res: Response) {
    const { organizationId, workspaceId } = req.params;
    try {
        const workspaceRoles = await prisma.workspaceRole.findMany({
            where: {
                workspaceId,
            },
            include: {
                permissions: true,
            },
        });

        const organizationRoles = await prisma.organizationRole.findMany({
            where: {
                organizationId,
            },
            include: {
                permissions: true,
            },
        });

        const orgPermissions = await prisma.orgPermission.findMany();

        const workspacePermissions = await prisma.workspacePermission.findMany();

        res.status(200).json({
            message: "Roles found successfully",
            workspaceRoles,
            organizationRoles,
            orgPermissions,
            workspacePermissions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
}



export async function createCustomRole(req: CustomRequest, res: Response) {
    const { name, description, permissions, organizationId } = req.body;
    try {
        const role = await prisma.organizationRole.create({
            data: {
                name,
                description,
                permissions: {
                    create: permissions,
                },
                organizationId,
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