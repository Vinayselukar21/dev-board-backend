import { PermissionType } from '../types'
import { prisma } from "../index";

async function AddWorkspaceRoles(workspaceId: string) {
  // Workspace Roles
  const workspaceRolesData = [
    {
      name: 'Owner',
      isDefault: false,
      workspaceId,
      description: 'Full control over workspace',
    },
    {
      name: 'Admin',
      isDefault: false,
      workspaceId,
      description: 'Manage projects and tasks, moderate members',
    },
    {
      name: 'Member',
      isDefault: false,
      workspaceId,
      description: 'Can view and edit assigned projects and tasks',
    },
    {
      name: 'Viewer',
      isDefault: true,
      workspaceId,
      description: 'Read-only access to all workspace data',
    },
  ];

  const roles = await prisma.workspaceRole.createMany({
    data: workspaceRolesData,
  });
  return roles
}

async function AddWorkspacePermissions(organizationId: string) {

  const permissions = await prisma.workspacePermission.findMany({
    where: {
      organizationId,
    },
  })

  if (permissions.length > 0) {
    return permissions
  }

  const permissionTypes = [
    PermissionType.PROJECT_VIEW,
    PermissionType.PROJECT_CREATE,
    PermissionType.PROJECT_EDIT,
    PermissionType.PROJECT_DELETE,

    PermissionType.TASK_VIEW,
    PermissionType.TASK_CREATE,
    PermissionType.TASK_EDIT,
    PermissionType.TASK_DELETE,

    PermissionType.MEMBER_ADD,
    PermissionType.MEMBER_REMOVE,
    PermissionType.MEMBER_CHANGE_ROLE,

    PermissionType.EVENT_VIEW,
    PermissionType.EVENT_CREATE,
    PermissionType.EVENT_EDIT,
    PermissionType.EVENT_EDIT_ANY,
    PermissionType.EVENT_CANCEL,
    PermissionType.EVENT_DELETE,

    PermissionType.ROLE_WORKSPACE_CREATE,
    PermissionType.ROLE_WORKSPACE_EDIT,
    PermissionType.ROLE_WORKSPACE_DELETE,

    PermissionType.DEPARTMENT_VIEW,
    PermissionType.DEPARTMENT_CREATE,
    PermissionType.DEPARTMENT_EDIT,
    PermissionType.DEPARTMENT_DELETE,
  ];

  await prisma.workspacePermission.createMany({
    data: permissionTypes.map((type) => ({
      name: type,
      organizationId,
    })),
  });
}


async function mapPermissionWithRoles(workspaceId: string, organizationId: string) {
  const permissions = await prisma.workspacePermission.findMany({
    where: {
      organizationId,
    },
  })

  const workspaceRoles = await prisma.workspaceRole.findMany({
    where: {
      workspaceId,
    },
  })

  const roleMap = {
    owner: [
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_EDIT",
      "PROJECT_DELETE",

      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_EDIT",
      "TASK_DELETE",

      "MEMBER_ADD",
      "MEMBER_REMOVE",
      "MEMBER_CHANGE_ROLE",

      "EVENT_VIEW",
      "EVENT_CREATE",
      "EVENT_EDIT",
      "EVENT_EDIT_ANY",
      "EVENT_CANCEL",
      "EVENT_DELETE",

      "ROLE_WORKSPACE_CREATE",
      "ROLE_WORKSPACE_EDIT",
      "ROLE_WORKSPACE_DELETE",

      "DEPARTMENT_VIEW",
      "DEPARTMENT_CREATE",
      "DEPARTMENT_EDIT",
      "DEPARTMENT_DELETE",
    ],
    admin: [
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_EDIT",

      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_EDIT",
      "TASK_DELETE",

      "MEMBER_ADD",
      "MEMBER_REMOVE",
      "MEMBER_CHANGE_ROLE",

      "EVENT_VIEW",
      "EVENT_CREATE",
      "EVENT_EDIT",
      "EVENT_EDIT_ANY",
      "EVENT_CANCEL",
      "EVENT_DELETE",

      "ROLE_WORKSPACE_CREATE",
      "ROLE_WORKSPACE_EDIT",
      "ROLE_WORKSPACE_DELETE",

      "DEPARTMENT_VIEW",
    ],
    member: [
      "PROJECT_VIEW",

      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_EDIT",
      "TASK_DELETE",

      "EVENT_VIEW",
      "EVENT_CREATE",
      "EVENT_EDIT",
      "EVENT_CANCEL",

      "DEPARTMENT_VIEW",
    ],
    viewer: [
      "PROJECT_VIEW",
      "TASK_VIEW",
      "EVENT_VIEW",
      "DEPARTMENT_VIEW",
    ],
  }

  const ownerPermissions = permissions.filter(p => roleMap.owner.includes(p.name)).map(p => {
    return {
      workspaceRoleId: workspaceRoles.find(role => role.name === 'Owner')!.id,
      workspacePermissionId: p.id,
    }
  });

  const adminPermissions = permissions.filter(p => roleMap.admin.includes(p.name)).map(p => {
    return {
      workspaceRoleId: workspaceRoles.find(role => role.name === 'Admin')!.id,
      workspacePermissionId: p.id,
    }
  });

  const memberPermissions = permissions.filter(p => roleMap.member.includes(p.name)).map(p => {
    return {
      workspaceRoleId: workspaceRoles.find(role => role.name === 'Member')!.id,
      workspacePermissionId: p.id,
    }
  });

  const viewerPermissions = permissions.filter(p => roleMap.viewer.includes(p.name)).map(p => {
    return {
      workspaceRoleId: workspaceRoles.find(role => role.name === 'Viewer')!.id,
      workspacePermissionId: p.id,
    }
  });




  const mappedPermissions = await prisma.workspaceRolePermission.createMany({
    data: [...ownerPermissions, ...adminPermissions, ...memberPermissions, ...viewerPermissions],
  })

  return mappedPermissions
}

export async function seedWorkspaceDefaultRoles(workspaceId: string, organizationId: string) {
  console.log("Seeding workspace default roles for workspace", workspaceId)
  const permissions = await AddWorkspacePermissions(organizationId)
  console.log("Permissions added successfully", permissions, "workspaceId", workspaceId)

  const roles = await AddWorkspaceRoles(workspaceId)
  console.log("Roles added successfully", roles, "workspaceId", workspaceId)

  const mappedPermissions = await mapPermissionWithRoles(workspaceId, organizationId)
  console.log("Permissions mapped with roles successfully", mappedPermissions, "workspaceId", workspaceId)
}