import { OrgPermissionType } from '../types';
import { prisma } from "../index";

async function addOrgRoles( organizationId: string) {
    // Organization Roles
    const orgRolesData = [
      {
        name: 'Owner',
        isDefault: false,
        organizationId,
        description: 'Full control over organization',
      },
      {
        name: 'Admin',
        isDefault: false,
        organizationId,
        description: 'Manage users and workspaces',
      },
      {
        name: 'Member',
        isDefault: false,
        organizationId,
        description: 'Standard member with limited access',
      },
      {
        name: 'Viewer',
        isDefault: true,
        organizationId,
        description: 'Read-only access to organization',
      },
    ];

    const orgRoles = await prisma.organizationRole.createMany({
      data: orgRolesData,
      skipDuplicates: true,
    });
    return orgRoles
}

async function addOrgPermissions(organizationId: string) {

    const orgPermissions = await prisma.orgPermission.findMany({
      where: {
        organizationId,
      },
    })

    if (orgPermissions.length > 0) {
      return orgPermissions
    }

    const permissionTypes = [
      OrgPermissionType.OWNER,
      OrgPermissionType.ORG_VIEW,
      OrgPermissionType.ORG_EDIT,
      OrgPermissionType.ORG_DELETE,
      OrgPermissionType.ORG_ONBOARD_USER,
      OrgPermissionType.ORG_REMOVE_USER,
      OrgPermissionType.ORG_CHANGE_USER_ROLE,
      OrgPermissionType.ORG_WORKSPACE_VIEW,
      OrgPermissionType.ORG_WORKSPACE_CREATE,
      OrgPermissionType.ORG_WORKSPACE_EDIT,
      OrgPermissionType.ORG_WORKSPACE_DELETE,
      OrgPermissionType.ORG_CUSTOM_ROLE_CREATE,
      OrgPermissionType.ORG_CUSTOM_ROLE_EDIT,
      OrgPermissionType.ORG_CUSTOM_ROLE_DELETE
    ];
  
    const permissions = await prisma.orgPermission.createMany({
      data: permissionTypes.map((type) => ({
        name: type,
        organizationId,
      })),
      skipDuplicates: true,
    });
    return permissions
}


async function mapPermissionWithRoles(organizationId: string) {
  const permissions = await prisma.orgPermission.findMany({
    where: {
      organizationId,
    },
  })

  const orgRoles = await prisma.organizationRole.findMany({
    where: {
      organizationId,
    },
  })

  const roleMap = {
    owner:  [
      "OWNER",

      "ORG_VIEW",
      "ORG_EDIT",
      "ORG_DELETE",
    
      "ORG_ONBOARD_USER",
      "ORG_REMOVE_USER",
      "ORG_CHANGE_USER_ROLE",
    
      "ORG_WORKSPACE_VIEW",
      "ORG_WORKSPACE_CREATE",
      "ORG_WORKSPACE_EDIT",
      "ORG_WORKSPACE_DELETE",
    
      "ORG_CUSTOM_ROLE_CREATE",
      "ORG_CUSTOM_ROLE_EDIT",
      "ORG_CUSTOM_ROLE_DELETE",
    ],
    admin:  [
      "ORG_VIEW",
      "ORG_WORKSPACE_VIEW",
      "ORG_WORKSPACE_CREATE",
      "ORG_WORKSPACE_EDIT",
      "ORG_CUSTOM_ROLE_CREATE",
      "ORG_CUSTOM_ROLE_EDIT",
      "ORG_CUSTOM_ROLE_DELETE",
    ],
    member: [
      "ORG_VIEW",
      "ORG_WORKSPACE_VIEW",
    ],
    viewer: [
      "ORG_VIEW",
      "ORG_WORKSPACE_VIEW",
    ],
  }

    const ownerPermissions = permissions.filter(p => roleMap.owner.includes(p.name)).map(p => {
      return {
        organizationRoleId: orgRoles.find(role => role.name === 'Owner')!.id,
        orgPermissionId: p.id,
      }
    });

    const adminPermissions = permissions.filter(p => roleMap.admin.includes(p.name)).map(p => {
      return {
        organizationRoleId: orgRoles.find(role => role.name === 'Admin')!.id,
        orgPermissionId: p.id,
      }
    });

    const memberPermissions = permissions.filter(p => roleMap.member.includes(p.name)).map(p => {
      return {
        organizationRoleId: orgRoles.find(role => role.name === 'Member')!.id,
        orgPermissionId: p.id,
      }
    });

    const viewerPermissions = permissions.filter(p => roleMap.viewer.includes(p.name)).map(p => {
      return {
        organizationRoleId: orgRoles.find(role => role.name === 'Viewer')!.id,
        orgPermissionId: p.id,
      }
    });

  

    
    const mappedPermissions = await prisma.orgRolePermission.createMany({
      data: [...ownerPermissions, ...adminPermissions, ...memberPermissions, ...viewerPermissions],
    })

  return mappedPermissions
}


export async function seedOrganizationDefaultRoles(organizationId: string) {
  const permissions = await addOrgPermissions(organizationId)
  console.log("Org Permissions added successfully", permissions)

  const roles = await addOrgRoles(organizationId)
  console.log("Org Roles added successfully", roles)


  const mapedRole = await mapPermissionWithRoles(organizationId)
  console.log("Org Permissions mapped with roles successfully", mapedRole)
}