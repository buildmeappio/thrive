import { z } from 'zod';
import ErrorMessages from '@/constants/ErrorMessages';
import { containsOnlySpecialChars, getFieldValidationPattern } from '@/utils/fieldValidation';

export const groupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Group name is required')
      .refine(val => val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
      })
      .min(2, 'Group name must be at least 2 characters')
      .max(255, 'Group name must be less than 255 characters')
      .refine(val => !containsOnlySpecialChars(val), {
        message: ErrorMessages.ORGANIZATION_NAME_INVALID,
      })
      .refine(
        val => {
          const pattern = getFieldValidationPattern('organizationName');
          return pattern ? pattern.test(val.trim()) : true;
        },
        {
          message: ErrorMessages.ORGANIZATION_NAME_INVALID,
        }
      ),
    roleId: z.string().min(1, 'Role is required'),
    scopeType: z.enum(['ORG', 'LOCATION_SET'], {
      error: 'Scope type is required',
    }),
    locationIds: z.array(z.string()).default([]),
    memberIds: z.array(z.string()).default([]),
  })
  .refine(
    data => {
      if (data.scopeType === 'LOCATION_SET' && data.locationIds.length === 0) {
        return false;
      }
      return true;
    },
    {
      message: 'At least one location is required for Location Set scope',
      path: ['locationIds'],
    }
  );

export type GroupFormData = z.infer<typeof groupSchema>;

export const groupInitialValues: GroupFormData = {
  name: '',
  roleId: '',
  scopeType: 'ORG',
  locationIds: [],
  memberIds: [],
};
