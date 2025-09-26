import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { Roles } from "../../constants/roles";

const checkUserExists = async (email: string) => {
  try {
    // find role with name MEDICAL_EXAMINER
    const medicalExaminerRole = await prisma.role.findFirst({
      where: {
        name: Roles.MEDICAL_EXAMINER,
      },
    });

    if (!medicalExaminerRole) {
      throw HttpError.notFound("MEDICAL_EXAMINER role not found");
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        accounts: {
          where: {
            roleId: medicalExaminerRole.id,
          },
        },
      },
    });

    if (!user) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
      account: user.accounts[0],
    };
  } catch (error) {
    throw HttpError.fromError(error, "Failed to check user exists", 500);
  }
};

export default checkUserExists;
