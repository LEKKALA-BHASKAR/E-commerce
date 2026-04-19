import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

export const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const resetSchema = z.object({
  password: z.string().min(8, 'Use at least 8 characters').max(128),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords don\'t match' });
