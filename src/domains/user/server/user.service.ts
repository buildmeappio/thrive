import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { Roles } from "@/domains/auth/constants/roles";
import { ENV } from "@/constants/variables";

const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        accounts: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw HttpError.notFound("User not found");
    }

    return user;
  } catch (error) {
    throw HttpError.fromError(error, "Failed to get user");
  }
};

const listAdminUsers = async () => {
  try {
    return await prisma.user.findMany({
      where: {
        accounts: {
          some: {
            role: {
              name: {
                not: Roles.SUPER_ADMIN,
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        isLoginEnabled: true,
        mustResetPassword: true,
        createdAt: true,
        accounts: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    throw HttpError.fromError(error, "Failed to list users");
  }
};

type CreateAdminUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
};

const generateTemporaryPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + numbers + symbols;

  const pick = (source: string) =>
    source[crypto.randomInt(0, source.length)];

  const base = [
    pick(upper),
    pick(lower),
    pick(numbers),
    pick(symbols),
  ];

  for (let i = base.length; i < 12; i += 1) {
    base.push(pick(all));
  }

  return base
    .sort(() => 0.5 - Math.random())
    .join("");
};

const sendUserInviteEmail = async ({
  firstName,
  email,
  temporaryPassword,
}: {
  firstName: string;
  email: string;
  temporaryPassword: string;
}) => {
  try {
    const emailService = (await import("@/services/email.service")).default;
    const loginLink = `${ENV.NEXT_PUBLIC_APP_URL}/admin/login`;
    const result = await emailService.sendEmail(
      "Welcome to Thrive Admin",
      "admin-user-invite.html",
      {
        firstName,
        email,
        temporaryPassword,
        loginLink,
        CDN_URL: ENV.NEXT_PUBLIC_CDN_URL ?? "",
        year: new Date().getFullYear(),
      },
      email
    );

    if (!result.success) {
      throw new Error((result as { error?: string }).error || "Unknown error");
    }
  } catch (error) {
    throw HttpError.fromError(error, "Failed to send invite email");
  }
};

const createAdminUser = async (input: CreateAdminUserInput) => {
  try {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw HttpError.conflict("A user with this email already exists.");
    }

    const adminRole = await prisma.role.findFirst({
      where: { name: Roles.ADMIN },
    });
    if (!adminRole) {
      throw HttpError.internalServerError("Admin role is not configured.");
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const { user } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: normalizedEmail,
          gender: input.gender,
          password: hashedPassword,
          isLoginEnabled: true,
          mustResetPassword: true,
          temporaryPasswordIssuedAt: new Date(),
        },
      });

      await tx.account.create({
        data: {
          userId: createdUser.id,
          roleId: adminRole.id,
        },
      });

      return { user: createdUser };
    });

    try {
      await sendUserInviteEmail({
        firstName: input.firstName,
        email: normalizedEmail,
        temporaryPassword,
      });
    } catch (emailError) {
      await prisma.account.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      throw emailError;
    }

    // Fetch the user with role information
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        isLoginEnabled: true,
        mustResetPassword: true,
        createdAt: true,
        accounts: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return userWithRole!;
  } catch (error) {
    throw HttpError.fromError(error, "Failed to create user");
  }
};

const toggleUserStatus = async (userId: string, isLoginEnabled: boolean) => {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isLoginEnabled },
      select: {
        id: true,
        isLoginEnabled: true,
      },
    });
    return updated;
  } catch (error) {
    throw HttpError.fromError(error, "Failed to update user status");
  }
};

type UpdateUserInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const updateUser = async ({
  id,
  firstName,
  lastName,
  email,
}: UpdateUserInput) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw HttpError.notFound("User not found");
    }

    if (normalizedEmail !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (emailTaken) {
        throw HttpError.conflict("A user with this email already exists.");
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        isLoginEnabled: true,
        mustResetPassword: true,
        createdAt: true,
        accounts: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return updated;
  } catch (error) {
    throw HttpError.fromError(error, "Failed to update user");
  }
};

const deleteUser = async (userId: string) => {
  try {
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  } catch (error) {
    throw HttpError.fromError(error, "Failed to delete user");
  }
};

const userService = {
  getUserById,
  listAdminUsers,
  createAdminUser,
  toggleUserStatus,
  updateUser,
  deleteUser,
};

export default userService;
