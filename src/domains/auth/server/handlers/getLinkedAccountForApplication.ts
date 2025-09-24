// domains/auth/server/handlers/getLinkedAccountForApplication.ts
import authService from "../auth.service";
import AuthDto from "../dto/auth.dto";

const getLinkedAccountForApplication = async (applicationId: string) => {
  const acc = await authService.getLinkedAccountForApplication(applicationId);
  return AuthDto.toAccountDto({ ...acc, role: acc.role!, user: acc.user! });
};

export default getLinkedAccountForApplication;
