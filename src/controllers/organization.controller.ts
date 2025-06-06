import { Response } from "express";
import { prisma } from "../index";
import { CustomRequest } from "../middlewares/verifyAccessToken";
import { OrgPermissionType } from "../types";
import { hashPassword } from "../utils/hash";
import log from "../utils/log";
import { seedOrganizationDefaultRoles } from "../utils/seed-organization-default-roles";

export async function getMyOrganization(req: CustomRequest, res: Response) {
    const { orgPermissions } = req.user!

    if (!orgPermissions.includes(OrgPermissionType.ORG_VIEW)) {
        res.status(400).json({ message: "You are not authorized to view the organization" });
        return
    }

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
                                    include: {
                                        member: {
                                            include: {
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
    const { orgPermissions } = req.user!

    if (!orgPermissions.includes(OrgPermissionType.OWNER)) {
        res.status(400).json({ message: "You are not authorized to create an organization" });
        return
    }

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
    const { orgPermissions } = req.user!

    if (!orgPermissions.includes(OrgPermissionType.ORG_ONBOARD_USER)) {
        res.status(400).json({ message: "You are not authorized to onboard a user" });
        return
    }

    const hashedPassword = await hashPassword(password);

    async function registerAndAddMember() {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
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
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                members: true,
            },
        });

        const organizationRoles = await prisma.organizationRole.findMany({
            where: {
                organizationId,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                members: true,
            },
        });

        const orgPermissions = await prisma.orgPermission.findMany({
            where: {
                organizationId,
            },
        });

        const workspacePermissions = await prisma.workspacePermission.findMany({
            where: {
                organizationId,
            },
        });

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
    const { orgPermissions } = req.user!

    if (!orgPermissions.includes(OrgPermissionType.ORG_CUSTOM_ROLE_CREATE)) {
        res.status(400).json({ message: "You are not authorized to create a custom role" });
        return
    }
    try {
        const role = await prisma.organizationRole.create({
            data: {
                name,
                description,
                permissions: {
                    createMany: {
                        data: permissions.map((permissionId: string) => ({
                            orgPermissionId: permissionId,
                        })),
                    },
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

export async function updateRole(req: CustomRequest, res: Response) {
    const { name, description, permissions, organizationId, roleId } = req.body;
    const { orgPermissions } = req.user!

    if (!orgPermissions.includes(OrgPermissionType.ORG_CUSTOM_ROLE_EDIT)) {
        res.status(400).json({ message: "You are not authorized to update a custom role" });
        return
    }
    try {
        const role = await prisma.organizationRole.update({
            where: {
                id: roleId,
                organizationId,
            },
            data: {
                name,
                description,
                permissions: {
                    deleteMany: {
                        orgPermissionId: {
                            in: permissions,
                        },
                    },
                    createMany: {
                        data: permissions.map((permissionId: string) => ({
                            orgPermissionId: permissionId,
                        })),
                    },
                },
            },
        });
        res.status(200).json({
            message: "Role updated successfully",
            role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
}
