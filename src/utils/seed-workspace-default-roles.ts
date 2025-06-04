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
    PermissionType.ADD_MEMBER,
    PermissionType.ALL_PROJECT,
    PermissionType.ALL_TASK,
    PermissionType.CHANGE_MEMBER_ROLE,
    PermissionType.CREATE_EVENT,
    PermissionType.CREATE_PROJECT,
    PermissionType.CREATE_TASK,
    PermissionType.DELETE_EVENT,
    PermissionType.DELETE_PROJECT,
    PermissionType.DELETE_TASK,
    PermissionType.EDIT_ANY_EVENT,
    PermissionType.EDIT_ANY_TASK,
    PermissionType.EDIT_EVENT,
    PermissionType.EDIT_PROJECT,
    PermissionType.REMOVE_MEMBER,
    PermissionType.VIEW_PROJECT,
    PermissionType.VIEW_TASK,
    PermissionType.CREATE_CUSTOM_WORKSPACE_ROLE,
    PermissionType.EDIT_CUSTOM_WORKSPACE_ROLE,
    PermissionType.DELETE_CUSTOM_WORKSPACE_ROLE,
    PermissionType.EDIT_EVENT,
    PermissionType.VIEW_EVENT,
    PermissionType.CANCEL_EVENT,
    PermissionType.CREATE_DEPARTMENT,
    PermissionType.EDIT_DEPARTMENT,
    PermissionType.DELETE_DEPARTMENT,
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
    owner: ['ALL_PROJECT', 'ALL_TASK', 'CHANGE_MEMBER_ROLE', 'CREATE_EVENT', 'CREATE_PROJECT', 'CREATE_TASK', 'DELETE_EVENT', 'DELETE_PROJECT', 'DELETE_TASK', 'EDIT_ANY_EVENT', 'EDIT_ANY_TASK', 'EDIT_EVENT', 'EDIT_PROJECT', 'ADD_MEMBER', 'REMOVE_MEMBER', 'VIEW_PROJECT', 'VIEW_TASK', 'CREATE_CUSTOM_WORKSPACE_ROLE', 'EDIT_CUSTOM_WORKSPACE_ROLE', 'DELETE_CUSTOM_WORKSPACE_ROLE', 'CANCEL_EVENT', 'VIEW_EVENT', 'CREATE_DEPARTMENT', 'EDIT_DEPARTMENT', 'DELETE_DEPARTMENT'],
    admin: ['ALL_PROJECT', 'ALL_TASK', 'CHANGE_MEMBER_ROLE', 'CREATE_EVENT', 'CREATE_PROJECT', 'CREATE_TASK', 'DELETE_EVENT', 'DELETE_PROJECT', 'DELETE_TASK', 'EDIT_ANY_EVENT', 'EDIT_ANY_TASK', 'EDIT_EVENT', 'EDIT_PROJECT', 'ADD_MEMBER', 'REMOVE_MEMBER', 'VIEW_PROJECT', 'VIEW_TASK', 'CREATE_CUSTOM_WORKSPACE_ROLE', 'EDIT_CUSTOM_WORKSPACE_ROLE', 'DELETE_CUSTOM_WORKSPACE_ROLE', 'CANCEL_EVENT', 'VIEW_EVENT', 'CREATE_DEPARTMENT', 'EDIT_DEPARTMENT', 'DELETE_DEPARTMENT'],
    member: ['VIEW_PROJECT', 'VIEW_TASK', 'VIEW_EVENT'],
    viewer: ['VIEW_PROJECT', 'VIEW_TASK', 'VIEW_EVENT'],
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