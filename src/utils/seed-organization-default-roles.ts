import { OrgPermissionType } from '@prisma/client';
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
      OrgPermissionType.VIEW_ORG,
      OrgPermissionType.EDIT_ORG,
      OrgPermissionType.DELETE_ORG,
      OrgPermissionType.ONBOARD_USER,
      OrgPermissionType.REMOVE_USER,
      OrgPermissionType.CHANGE_USER_ROLE,
      OrgPermissionType.VIEW_WORKSPACE,
      OrgPermissionType.CREATE_WORKSPACE,
      OrgPermissionType.EDIT_WORKSPACE,
      OrgPermissionType.DELETE_WORKSPACE,

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
    owner:  ['OWNER', 'VIEW_ORG','EDIT_ORG','DELETE_ORG','ONBOARD_USER','REMOVE_USER','CHANGE_USER_ROLE','VIEW_WORKSPACE','CREATE_WORKSPACE','EDIT_WORKSPACE','DELETE_WORKSPACE'],
    admin:  ['VIEW_ORG','ONBOARD_USER','REMOVE_USER','CHANGE_USER_ROLE','VIEW_WORKSPACE','CREATE_WORKSPACE','EDIT_WORKSPACE','DELETE_WORKSPACE'],
    member: ['VIEW_ORG','VIEW_WORKSPACE'],
    viewer: ['VIEW_ORG','VIEW_WORKSPACE'],
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
//   console.log(data)
// })

// const orgRolesData = [
//   {
//     name: 'Owner',
//     isDefault: false,
//     organizationId,
//     description: 'Full control over organization',
//     permissions: {
//       create: [
//         { type: OrgPermissionType.OWNER },
//         { type: OrgPermissionType.VIEW_ORG },
//         { type: OrgPermissionType.EDIT_ORG },
//         { type: OrgPermissionType.DELETE_ORG },
        
//         { type: OrgPermissionType.ONBOARD_USER },
//         { type: OrgPermissionType.REMOVE_USER },
//         { type: OrgPermissionType.CHANGE_USER_ROLE },

//         { type: OrgPermissionType.VIEW_WORKSPACE },
//         { type: OrgPermissionType.CREATE_WORKSPACE },
//         { type: OrgPermissionType.EDIT_WORKSPACE },
//         { type: OrgPermissionType.DELETE_WORKSPACE },
//       ],
//     },
//   },
//   {
//     name: 'Admin',
//     isDefault: false,
//     organizationId,
//     description: 'Manage users and workspaces',
//     permissions: {
//       create: [
//         { type: OrgPermissionType.VIEW_ORG },
//         { type: OrgPermissionType.ONBOARD_USER },
//         { type: OrgPermissionType.REMOVE_USER },
//         { type: OrgPermissionType.CHANGE_USER_ROLE },

//         { type: OrgPermissionType.VIEW_WORKSPACE },
//         { type: OrgPermissionType.CREATE_WORKSPACE },
//         { type: OrgPermissionType.EDIT_WORKSPACE },
//         { type: OrgPermissionType.DELETE_WORKSPACE },
//       ],
//     },
//   },
//   {
//     name: 'Member',
//     isDefault: false,
//     organizationId,
//     description: 'Standard member with limited access',
//     permissions: {
//       create: [
//         { type: OrgPermissionType.VIEW_ORG },
//         { type: OrgPermissionType.VIEW_WORKSPACE },
//       ],
//     },
//   },
//   {
//     name: 'Viewer',
//     isDefault: true,
//     organizationId,
//     description: 'Read-only access to organization',
//     permissions: {
//       create: [
//         { type: OrgPermissionType.VIEW_ORG },
//         { type: OrgPermissionType.VIEW_WORKSPACE },
//       ],
//     },
//   },
// ];