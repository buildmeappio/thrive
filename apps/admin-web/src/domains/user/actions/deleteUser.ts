'use server';

import { z } from 'zod';
import userService from '../server/user.service';
import logger from '@/utils/logger';

const schema = z.object({
  id: z.string().uuid(),
});

type DeleteUserInput = z.infer<typeof schema>;

export const deleteUser = async (
  rawInput: DeleteUserInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    const input = schema.parse(rawInput);
    await userService.deleteUser(input.id);
    return { success: true };
  } catch (error) {
    logger.error('Delete user failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
};

export default deleteUser;
