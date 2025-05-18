import { PermissionType } from '@prisma/client';
import { prisma } from "../index";

async function main(workspaceId: string) {
  // Workspace Roles
  const workspaceRolesData = [
    {
      name: 'Owner',
      isDefault: false,
      workspaceId,
      description: 'Full control over workspace',
      permissions: {
        create: [
          { type: PermissionType.ALL_PROJECT },
          { type: PermissionType.CREATE_PROJECT },
          { type: PermissionType.EDIT_PROJECT },
          { type: PermissionType.DELETE_PROJECT },

          { type: PermissionType.ALL_TASK },
          { type: PermissionType.CREATE_TASK },
          { type: PermissionType.EDIT_ANY_TASK },
          { type: PermissionType.DELETE_TASK },

          { type: PermissionType.ADD_MEMBER },
          { type: PermissionType.REMOVE_MEMBER },
          { type: PermissionType.CHANGE_MEMBER_ROLE },

          { type: PermissionType.CREATE_EVENT },
          { type: PermissionType.EDIT_EVENT },
          { type: PermissionType.EDIT_ANY_EVENT },
          { type: PermissionType.DELETE_EVENT },
        ],
      },
    },
    {
      name: 'Admin',
      isDefault: false,
      workspaceId,
      description: 'Manage projects and tasks, moderate members',
      permissions: {
        create: [
          { type: PermissionType.CREATE_PROJECT },
          { type: PermissionType.EDIT_PROJECT },
          { type: PermissionType.DELETE_PROJECT },

          { type: PermissionType.CREATE_TASK },
          { type: PermissionType.EDIT_ANY_TASK },
          { type: PermissionType.DELETE_TASK },

          { type: PermissionType.ADD_MEMBER },
          { type: PermissionType.REMOVE_MEMBER },
          { type: PermissionType.CHANGE_MEMBER_ROLE },

          { type: PermissionType.CREATE_EVENT },
          { type: PermissionType.EDIT_EVENT },
          { type: PermissionType.EDIT_ANY_EVENT },
          { type: PermissionType.DELETE_EVENT },
        ],
      },
    },
    {
      name: 'Member',
      isDefault: false,
      workspaceId,
      description: 'Can view and edit assigned projects and tasks',
      permissions: {
        create: [
          { type: PermissionType.VIEW_PROJECT },
          { type: PermissionType.CREATE_TASK },
          { type: PermissionType.EDIT_PROJECT },
          { type: PermissionType.EDIT_ANY_TASK },

          { type: PermissionType.CREATE_EVENT },
          { type: PermissionType.EDIT_EVENT },
        ],
      },
    },
    {
      name: 'Viewer',
      isDefault: true,
      workspaceId,
      description: 'Read-only access to all workspace data',
      permissions: {
        create: [
          { type: PermissionType.VIEW_PROJECT },
          { type: PermissionType.VIEW_TASK },
        ],
      },
    },
  ];

  // Create workspace roles if not exist
  for (const role of workspaceRolesData) {
    const exists = await prisma.workspaceRole.findFirst({ where: { name: role.name } });
    if (!exists) {
      await prisma.workspaceRole.create({ data: role });
    }
  }
}

export async function seedWorkspaceDefaultRoles(workspaceId: string) {
  await main(workspaceId)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
    await prisma.$disconnect();
  });
}
