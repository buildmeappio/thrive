import authService from "../auth.service";
import AuthDto from "../dto/auth.dto";

const adminCreateInvite = async (applicationId: string, ttlHours = 168) => {
  const { invite, link } = await authService.createInviteForApplication(applicationId, ttlHours);
  return { invite: AuthDto.toInviteDto(invite), link };
};

export default adminCreateInvite;
