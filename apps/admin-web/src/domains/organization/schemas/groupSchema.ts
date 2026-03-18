import { z } from 'zod';

export const groupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Group name is required')
      .min(2, 'Group name must be at least 2 characters')
      .max(255, 'Group name must be less than 255 characters'),
    scopeType: z.enum(['ORG', 'LOCATION_SET'], {
      error: 'Scope type is required',
    }),
    locationIds: z.array(z.string()),
    memberIds: z.array(z.string()),
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
  scopeType: 'ORG',
  locationIds: [],
  memberIds: [],
};
