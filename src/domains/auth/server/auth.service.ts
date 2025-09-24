import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { Roles } from "@/domains/auth/constants/roles";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { SubmitExaminerApplicationInput, ConsumeInviteAndSetPasswordInput, SendVerificationCodeInput, LoginInput, VerifyCodeInput } from "../types";


class AuthService {
  /** 1) Public: submit onboarding application */
  async submitExaminerApplication(input: SubmitExaminerApplicationInput) {
    const email = input.emailAddress.trim().toLowerCase();

    // defensive uniqueness checks
    const existingProfile = await prisma.examinerProfile.findFirst({
      where: { emailAddress: email, deletedAt: null },
      select: { id: true },
    });
    if (existingProfile) {
      // if an application already exists for this profile, short-circuit
      const existingApp = await prisma.examinerApplication.findFirst({
        where: { profileId: existingProfile.id, deletedAt: null },
        select: { id: true, status: true },
      });
      if (existingApp) {
        throw HttpError.conflict("An application for this email already exists");
      }
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const profile = await tx.examinerProfile.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            emailAddress: email,
            phoneNumber: input.phoneNumber,
            provinceOfResidence: input.provinceOfResidence,
            mailingAddress: input.mailingAddress,

            licenseNumber: input.licenseNumber,
            provinceOfLicensure: input.provinceOfLicensure,
            licenseExpiryDate: input.licenseExpiryDate,

            yearsOfIMEExperience: input.yearsOfIMEExperience,
            forensicAssessmentTrained: input.forensicAssessmentTrained,
            experienceDetails: input.experienceDetails,

            preferredRegions: input.preferredRegions,
            maxTravelDistanceKm: input.maxTravelDistanceKm,
            daysAvailable: input.daysAvailable as any, // enum[]
            timeMorning: input.timeMorning,
            timeAfternoon: input.timeAfternoon,
            timeEvening: input.timeEvening,
            acceptVirtualAssessments: input.acceptVirtualAssessments,

            languagesSpoken: input.languagesSpoken,
            specialties: input.specialties,
          },
        });

        if (input.documents?.length) {
          await tx.examinerProfileDocument.createMany({
            data: input.documents.map((d) => ({
              profileId: profile.id,
              documentId: d.documentId,
              type: d.type,
            })),
            skipDuplicates: true,
          });
        }

        const application = await tx.examinerApplication.create({
          data: {
            profileId: profile.id,
            status: "PENDING",
          },
          include: { profile: true },
        });

        return { application };
      });

      return result.application;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to submit examiner application");
    }
  }

  /** 2) Admin: create invite for accepted application */
  async createInviteForApplication(applicationId: string, ttlHours = 168) {
    try {
      const app = await prisma.examinerApplication.findUnique({
        where: { id: applicationId },
        include: { profile: true },
      });
      if (!app) throw HttpError.notFound("Application not found");
      if (app.status !== "ACCEPTED") {
        throw HttpError.badRequest("Application is not accepted");
      }

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

      const invite = await prisma.examinerApplicationInvite.create({
        data: {
          applicationId: app.id,
          token,
          expiresAt,
          status: "PENDING",
        },
      });

      return {
        invite,
        link: `${process.env.NEXT_PUBLIC_APP_URL}/examiner/create-password?token=${token}`,
      };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to create invite");
    }
  }

  /** 3) Public: consume invite and set password, provision User/Account/Examiner, link application */
  async consumeInviteAndSetPassword(input: ConsumeInviteAndSetPasswordInput) {
    const { token, password } = input;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const invite = await tx.examinerApplicationInvite.findUnique({
          where: { token },
          include: {
            application: { include: { profile: true } },
          },
        });
        if (!invite) throw HttpError.notFound("Invite not found");

        if (invite.status !== "PENDING") throw HttpError.badRequest("Invite is not pending");
        if (invite.expiresAt <= new Date()) throw HttpError.badRequest("Invite expired");

        const app = invite.application;
        if (!app || app.status !== "ACCEPTED") {
          throw HttpError.badRequest("Application not accepted");
        }

        // If already linked, idempotently return existing
        if (app.linkedAccountId) {
          const existing = await tx.account.findUnique({
            where: { id: app.linkedAccountId },
            include: { user: true },
          });
          if (existing) {
            // mark invite consumed if still pending
            await tx.examinerApplicationInvite.update({
              where: { id: invite.id },
              data: { status: "CONSUMED", consumedAt: new Date(), lastOpenedAt: new Date() },
            });
            return { account: existing, created: false };
          }
        }

        // Resolve or create User
        const email = app.profile.emailAddress.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 12);

        let user = await tx.user.findUnique({ where: { email } });
        if (user) {
          // Update password ownership to ensure user can log in
          user = await tx.user.update({
            where: { id: user.id },
            data: { password: hashed, firstName: app.profile.firstName, lastName: app.profile.lastName, phone: app.profile.phoneNumber },
          });
        } else {
          user = await tx.user.create({
            data: {
              firstName: app.profile.firstName,
              lastName: app.profile.lastName,
              email,
              password: hashed,
              phone: app.profile.phoneNumber,
            },
          });
        }

        // Role lookup
        const examinerRole = await tx.role.findFirst({
          where: { name: Roles.MEDICAL_EXAMINER },
        });
        if (!examinerRole) throw HttpError.badRequest("MEDICAL_EXAMINER role missing");

        // Create Account
        const account = await tx.account.create({
          data: {
            roleId: examinerRole.id,
            userId: user.id,
            isVerified: false, // will be set after code verification
          },
          include: { user: true },
        });

        // Create Examiner bound to the same profile
        await tx.examiner.create({
          data: {
            accountId: account.id,
            profileId: app.profileId,
            isEnabled: true,
          },
        });

        // Link application to account and consume invite
        await tx.examinerApplication.update({
          where: { id: app.id },
          data: { linkedAccountId: account.id },
        });
        await tx.examinerApplicationInvite.update({
          where: { id: invite.id },
          data: { status: "CONSUMED", consumedAt: new Date(), lastOpenedAt: new Date() },
        });

        return { account, created: true };
      });

      return result;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to consume invite");
    }
  }

  /** 4) Auth: login by email/password. Returns the primary examiner account if present. */
  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            include: { role: true },
          },
        },
      });
      if (!user) throw HttpError.unauthorized("Invalid credentials");

      const ok = await bcrypt.compare(input.password, user.password);
      if (!ok) throw HttpError.unauthorized("Invalid credentials");

      // prefer MEDICAL_EXAMINER account for examiner portal
      const examinerAccount = user.accounts.find(
        (a) => a.role.name === Roles.MEDICAL_EXAMINER
      );
      if (!examinerAccount) {
        throw HttpError.forbidden("No examiner account for this user");
      }

      // token issuance is out of scope; return account for caller to mint JWT
      return {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        account: { id: examinerAccount.id, role: examinerAccount.role.name, isVerified: examinerAccount.isVerified },
      };
    } catch (error) {
      throw HttpError.fromError(error, "Login failed");
    }
  }

  /** 5) Issue verification code for an account (email or SMS handled by caller). */
  async sendVerificationCode(input: SendVerificationCodeInput) {
    const { email, ttlMinutes = 10 } = input;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw HttpError.notFound("User not found");
      const account = await prisma.account.findFirst({ where: { userId: user.id } });
      if (!account) throw HttpError.notFound("Account not found");

      const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 digits
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
      const accountId = account.id;

      await prisma.verificationCodes.create({
        data: {
          accountId,
          code,
          expiresAt,
        },
      });

      return { code, expiresAt }; // caller sends it through email/SMS provider
    } catch (error) {
      throw HttpError.fromError(error, "Failed to send verification code");
    }
  }

  /** 6) Verify code and mark account as verified. */
  async verifyCode(input: VerifyCodeInput) {
    const { accountId, code } = input;

    try {
      const vc = await prisma.verificationCodes.findFirst({
        where: { accountId, code, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      if (!vc) throw HttpError.badRequest("Invalid code");
      if (vc.expiresAt <= new Date()) throw HttpError.badRequest("Code expired");

      const account = await prisma.account.update({
        where: { id: accountId },
        data: { isVerified: true },
      });

      // soft-delete or clean the code
      await prisma.verificationCodes.update({
        where: { id: vc.id },
        data: { deletedAt: new Date() },
      });

      return { isVerified: account.isVerified };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to verify code");
    }
  }

  /** 7) Change password for logged-in user */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw HttpError.notFound("User not found");

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) throw HttpError.unauthorized("Current password incorrect");

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

      return { success: true };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to change password");
    }
  }

  /** 8) Forgot password: send code against primary examiner account of the email. */
  async forgotPasswordRequest(email: string, ttlMinutes = 10) {
    const e = email.trim().toLowerCase();

    try {
      const user = await prisma.user.findUnique({
        where: { email: e },
        include: { accounts: { include: { role: true } } },
      });
      if (!user) return { ok: true }; // do not reveal existence

      const examinerAccount = user.accounts.find(
        (a) => a.role.name === Roles.MEDICAL_EXAMINER
      );
      if (!examinerAccount) return { ok: true };

      const { code, expiresAt } = await this.sendVerificationCode({
        accountId: examinerAccount.id,
        ttlMinutes,
      });

      return {
        ok: true, // caller sends code to email/SMS
        meta: process.env.NODE_ENV === "development" ? { code, expiresAt } : undefined,
      };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to start password reset");
    }
  }

  /** 9) Forgot password: verify code and set new password */
  async forgotPasswordConfirm(email: string, code: string, newPassword: string) {
    const e = email.trim().toLowerCase();

    try {
      const user = await prisma.user.findUnique({
        where: { email: e },
        include: { accounts: true },
      });
      if (!user) throw HttpError.badRequest("Invalid code");

      // pick any linked account for verification; prefer examiner
      const accountId = user.accounts[0]?.id;
      if (!accountId) throw HttpError.badRequest("Invalid code");

      await this.verifyCode({ accountId, code });

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

      return { success: true };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to reset password");
    }
  }

  /** Helper to assert an application is linked to an account (used by handlers) */
  async getLinkedAccountForApplication(applicationId: string) {
    const app = await prisma.examinerApplication.findUnique({
      where: { id: applicationId },
      include: { linkedAccount: { include: { user: true, role: true } } },
    });
    if (!app) throw HttpError.notFound("Application not found");
    if (!app.linkedAccountId || !app.linkedAccount) {
      throw HttpError.badRequest("Application not linked to an account");
    }
    return app.linkedAccount;
  }
}

export default new AuthService();
