import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret, prisma } from "../index";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateTokens } from "../utils/generateTokens";
import { accessCookieMaxAge, refreshCookieMaxAge } from "../utils/cookieMaxAge";
import { Organization, User } from "@prisma/client";
import { seedOrganizationDefaultRoles } from "../utils/seed-organization-default-roles";

export function login(req: Request, res: Response) {
  const { email, password } = req.body;

  async function getUser() {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        memberships: true,
        organization: true,
        ownedOrganization: {
          include: {
            owner: true,
            users: true,
          },
        },
      },
    });
    return user;
  }

  async function validateUser() {
    const user = await getUser();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const tokens = await generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: new Date().toISOString(),
    });
    // save the refresh token to db - task
    return res
      .cookie("access_token", tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: accessCookieMaxAge,
      })
      .cookie("refresh_token", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: refreshCookieMaxAge,
      })
      .status(200)
      .json({
        message: "Login successful",
        ...tokens,
        authStatus: "authenticated",
        user: {
          email: user.email,
          name: user.name,
          id: user.id,
          role: user.role,
          createdAt: user.createdAt,
          contactNo: user.contactNo,
          location: user.location,
          jobTitle: user.jobTitle,
          designation: user.designation,
          memberships: user.memberships,
          organizationId: user.organizationId,
          organization: user.organization,
          ownedOrganization: user.ownedOrganization,
        },
      });
  }

  validateUser();
}

export async function register(req: Request, res: Response) {
  const { name, email, password, role, contactNo, location, organizationName, organizationType, jobTitle, designation } = req.body;
  const hashedPassword = await hashPassword(password);

  async function createOrganization(user: User, type: string, name: string) {
    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        ownerId: user.id,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        users: true,
        owner: true,
      },
    });
    
    return organization;
  }
  async function main() {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        contactNo,
        location,
        password: hashedPassword,
        role,
        jobTitle,
        designation,
      },
      include: {
        organization: true,
      },
    });
    return user;
  }

  async function giveUserOwnerPermission(user: User, organizationId: string) {
    const orgRoles = await prisma.organizationRole.findMany({
      where: {
        organizationId,
      },
    });
    const orgRole = orgRoles.find((role) => role.name === "Owner");
    if (!orgRole) {
      return;
    }
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        organizationRoleId: orgRole.id,
      },
    });
  }


  await main()
    .then(async (response) => {
      const organization = await createOrganization(response, organizationType, organizationName);

      console.log("Seeded organization default roles for organization: 1", organization.id);
      await seedOrganizationDefaultRoles(organization.id);
      await giveUserOwnerPermission(response, organization.id);
      const tokens = await generateTokens({
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
        lastLogin: new Date().toISOString(),
      });
      console.log(response);
      res
        .cookie("access_token", tokens.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: accessCookieMaxAge,
        })
        .cookie("refresh_token", tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: refreshCookieMaxAge,
        })
        .status(200)
        .json({
          message: "Registered : " + JSON.stringify(response),
          ...tokens,
          authStatus: "authenticated",
          user: {
            email: response.email,
            name: response.name,
            id: response.id,
            role: response.role,
            createdAt: response.createdAt,
            contactNo: response.contactNo,
            jobTitle: response.jobTitle,
            designation: response.designation,
            location: response.location,
            organizationId: organization.id,
            ownedOrganization: organization,
            organization: organization,
          },
        });
    })
    .catch(async (e) => {
      console.error(e);
      // await prisma.$disconnect();
      res.status(500).json({ message: "Failed to register" });
      return;
    });
}

export function logout(req: Request, res: Response) {
  res
    .clearCookie("access_token")
    .clearCookie("refresh_token")
    .status(200)
    .send({
      message: "Logout Successful",
      authStatus: "unauthenticated",
    });
  return;
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refresh_token;
  if (!token) {
    res.sendStatus(403);
    return;
  }
  try {
    // validate access token here - task
    const decoded = jwt.verify(token, jwtSecret.refreshToken);
    const { id, email, name, role, lastLogin } = decoded as {
      id: string;
      email: string;
      name: string;
      role: string;
      lastLogin: string;
    };
    const { accessToken } = await generateTokens({
      id,
      name,
      email,
      role,
      lastLogin,
    });

    res
      .status(200)
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: accessCookieMaxAge,
      })
      .json({
        message: "Token refreshed",
        accessToken: accessToken,
        authStatus: "authenticated",
      });
  } catch (err) {
    res.sendStatus(403);
    return;
  }
}

export async function me(req: Request, res: Response) {
  const token = req.cookies.access_token;
  if (!token) {
    res.sendStatus(401);
    return;
  }
  try {
    const decoded = jwt.verify(token, jwtSecret.accessToken);
    const { id, email, name, role } = decoded as {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        id: id,
      },
      include: {
        memberships: true,
        ownedOrganization: {
          include: {
            owner: true,
            users: true,
          },
        },
        organization: true,
        ownedWorkspaces: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({
      message: "User found",
      user: {
        email: user.email,
        name: user.name,
        id: user.id,
        role: user.role,
        jobTitle: user.jobTitle,
        designation: user.designation,
        createdAt: user.createdAt,
        contactNo: user.contactNo,
        location: user.location,
        memberships: user.memberships,
        organizationId: user.organizationId,
        organization: user.organization,
        ownedWorkspaces: user.ownedWorkspaces,
        ownedOrganization: user.ownedOrganization,
      },
      authStatus: "authenticated",
    });
    return;
  } catch (err) {
    res.sendStatus(401);
    return;
  }
}

export function forgotPassword(req: Request, res: Response) {
  res.send("Forgot Password");
}

export function resetPassword(req: Request, res: Response) {
  res.send("Reset Password");
}

export function verifyEmail(req: Request, res: Response) {
  res.send("Verify Email");
}

export function resendVerifyEmail(req: Request, res: Response) {
  res.send("Resend Verify Email");
}

export function sendPasswordResetEmail(req: Request, res: Response) {
  res.send("Send Password Reset Email");
}

export function verifyPasswordResetToken(req: Request, res: Response) {
  res.send("Verify Password Reset Token");
}

export function changePassword(req: Request, res: Response) {
  res.send("Change Password");
}
