import type { Prisma as PrismaClient } from "@prisma/client";

declare module "@prisma/client" {
  namespace Prisma {
    interface UserCreateInput {
      isLoginEnabled?: boolean;
      mustResetPassword?: boolean;
      temporaryPasswordIssuedAt?: Date | string | null;
    }

    interface UserUncheckedCreateInput {
      isLoginEnabled?: boolean;
      mustResetPassword?: boolean;
      temporaryPasswordIssuedAt?: Date | string | null;
    }

    interface UserUpdateInput {
      isLoginEnabled?:
      | boolean
      | PrismaClient.BoolFieldUpdateOperationsInput;
      mustResetPassword?:
      | boolean
      | PrismaClient.BoolFieldUpdateOperationsInput;
      temporaryPasswordIssuedAt?:
      | Date
      | string
      | PrismaClient.NullableDateTimeFieldUpdateOperationsInput;
    }

    interface UserUncheckedUpdateInput {
      isLoginEnabled?:
      | boolean
      | PrismaClient.BoolFieldUpdateOperationsInput;
      mustResetPassword?:
      | boolean
      | PrismaClient.BoolFieldUpdateOperationsInput;
      temporaryPasswordIssuedAt?:
      | Date
      | string
      | PrismaClient.NullableDateTimeFieldUpdateOperationsInput;
    }
  }
}

