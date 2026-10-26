import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const adminProvisioningSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(12, 'Administrator passwords must be at least 12 characters long.'),
});
