import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name is too short').max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8, 'Use at least 8 characters').max(128),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
};

export const forgotSchema = {
  body: z.object({ email: z.string().email().toLowerCase() }),
};

export const resetSchema = {
  body: z.object({
    token: z.string().min(10),
    password: z.string().min(8).max(128),
  }),
};
