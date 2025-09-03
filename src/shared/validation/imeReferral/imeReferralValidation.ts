import { z } from 'zod';

export const ClaimantDetailsSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  addressLookup: z.string()
    .min(5, 'Address lookup must be at least 5 characters'),
  street: z.string().optional(),
  apt: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
});

export type ClaimantDetails = z.infer<typeof ClaimantDetailsSchema>;

export const ClaimantDetailsInitialValues: ClaimantDetails = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  addressLookup: '',
  street: '',
  apt: '',
  city: '',
  postalCode: '',
  province: '',
};