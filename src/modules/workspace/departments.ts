
import { CustomRequest } from "../../middlewares/verifyAccessToken";
import { prisma } from "../../index";
import log from "../../utils/log";
import { Request, Response } from "express";
import { PermissionType } from "../../types";

export async function createDepartment(req: CustomRequest, res: Response) {

  const { workspacePermissions } = req.user!;
  const { name, workspaceId } = req.body;
  
      const workspaceMemberPermissions = workspacePermissions.find((permission) => permission.workspaceId === workspaceId);
      if (!workspaceMemberPermissions?.permissions.includes(PermissionType.DEPARTMENT_CREATE)) {
        res.status(400).json({ message: "You are not authorized to create a department" });
        return
      }

  async function createDepartment() {
    const department = await prisma.department.create({
      data: {
        name,
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });
    return department;
  }

  try {
    const department = await createDepartment();
    log(
      "workspace",
      "create",
      `${req?.user?.name} created a new department "${department?.name}" in workspace ${department?.workspace?.name}.`,
      req.user?.id!,
      department?.workspace?.id
    );
    res.status(200).json({
      message: "Department created successfully",
      data:department,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create department",
      error: error || "Something went wrong",
    });
  }
}

export async function getDepartments(req: Request, res: Response) {
  const { workspaceId } = req.params;
  async function getDepartments() {
    const departments = await prisma.department.findMany({
      where: {
        workspaceId: workspaceId,
      },
    });
    return departments;
  }

  try {
    const departments = await getDepartments();
    res.status(200).json({
      message: "Departments found successfully",
      data:departments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get departments",
      error: error || "Something went wrong",
    });
  }
}


