import { OrgPermissionType } from '@prisma/client';
import { prisma } from "../index";

async function main( organizationId: string) {
  // Organization Roles
  const orgRolesData = [
    {
      name: 'Owner',
      isDefault: false,
      organizationId,
      description: 'Full control over organization',
      permissions: {
        create: [
          { type: OrgPermissionType.OWNER },
          { type: OrgPermissionType.VIEW_ORG },
          { type: OrgPermissionType.EDIT_ORG },
          { type: OrgPermissionType.DELETE_ORG },
          
          { type: OrgPermissionType.ONBOARD_USER },
          { type: OrgPermissionType.REMOVE_USER },
          { type: OrgPermissionType.CHANGE_USER_ROLE },

          { type: OrgPermissionType.VIEW_WORKSPACE },
          { type: OrgPermissionType.CREATE_WORKSPACE },
          { type: OrgPermissionType.EDIT_WORKSPACE },
          { type: OrgPermissionType.DELETE_WORKSPACE },
        ],
      },
    },
    {
      name: 'Admin',
      isDefault: false,
      organizationId,
      description: 'Manage users and workspaces',
      permissions: {
        create: [
          { type: OrgPermissionType.VIEW_ORG },
          { type: OrgPermissionType.ONBOARD_USER },
          { type: OrgPermissionType.REMOVE_USER },
          { type: OrgPermissionType.CHANGE_USER_ROLE },

          { type: OrgPermissionType.VIEW_WORKSPACE },
          { type: OrgPermissionType.CREATE_WORKSPACE },
          { type: OrgPermissionType.EDIT_WORKSPACE },
          { type: OrgPermissionType.DELETE_WORKSPACE },
        ],
      },
    },
    {
      name: 'Member',
      isDefault: false,
      organizationId,
      description: 'Standard member with limited access',
      permissions: {
        create: [
          { type: OrgPermissionType.VIEW_ORG },
          { type: OrgPermissionType.VIEW_WORKSPACE },
        ],
      },
    },
    {
      name: 'Viewer',
      isDefault: true,
      organizationId,
      description: 'Read-only access to organization',
      permissions: {
        create: [
          { type: OrgPermissionType.VIEW_ORG },
          { type: OrgPermissionType.VIEW_WORKSPACE },
        ],
      },
    },
  ];

  // Create organization roles if not exist
  for (const role of orgRolesData) {
    const exists = await prisma.organizationRole.findFirst({ where: { name: role.name } });
    if (!exists) {
      await prisma.organizationRole.create({ data: role });
    }
  }
}

export async function seedOrganizationDefaultRoles(organizationId: string) {
  console.log("Seeding organization default roles for organization: 2", organizationId);
  await main(organizationId)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
    await prisma.$disconnect();
  });
}
