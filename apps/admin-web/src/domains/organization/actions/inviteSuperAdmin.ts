'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const inviteSuperAdmin = async (
  organizationId: string,
  email: string,
  firstName: string,
  lastName: string,
  organizationRoleId?: string
) => {
  try {
    const { organizationService, tenantSession } = await getTenantContext();

    // Get account ID from tenant session
    // Note: Tenant session may not have accountId directly, we may need to look it up
    // For now, we'll pass null as invitedByAccountId since tenant users may not have accounts
    const invitedByAccountId = null; // TODO: Get from tenant session if available

    const invitation = await organizationService.inviteSuperAdmin(
      organizationId,
      email,
      firstName,
      lastName,
      invitedByAccountId || null,
      organizationRoleId
    );

    return {
      success: true,
      invitationId: invitation.id,
    };
  } catch (error) {
    logger.error('Error inviting superadmin:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_SEND_INVITATION,
    };
  }
};

export default inviteSuperAdmin;
