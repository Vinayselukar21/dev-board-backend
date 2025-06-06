import { prisma } from "../index";

export async function getPermissions(id: string) {
    async function getUser() {
        const user = await prisma.user.findUnique({
          where: {
            id
          },
          include: {
            memberships: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
                workspace: true,
              },
            },
            organization: true,
            ownedOrganization: {
              include: {
                owner: true,
                users: true,
              },
            },
            organizationRole: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });
        return user;
      }

  const user = await getUser();

  const orgPermissions = user?.organizationRole?.permissions?.map((role) => role.permission.name) || [];
  const workspacePermissions = user?.memberships?.map((membership) => {
      const workspacePermissions = membership.role?.permissions?.map((role) => role.permission.name) || [];
      return {
        workspaceName: membership.workspace.name,
        workspaceId: membership.workspace.id,
        permissions: workspacePermissions,
      };
    });

  return {
    orgPermissions,
    workspacePermissions,
  };
}