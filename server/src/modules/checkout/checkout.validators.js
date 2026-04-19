import { z } from 'zod';

export const validateCoupon = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.coerce.number().min(0),
});

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(3).max(160),
  line2: z.string().trim().max(160).optional().default(''),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().max(80).optional().default(''),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(2).default('IN'),
});

export const createOrder = z.object({
  items: z.array(z.object({
    product: z.string().min(1),
    qty: z.coerce.number().int().min(1).max(99),
    sku: z.string().optional().default(''),
  })).min(1),
  shipping: addressSchema,
  billing: addressSchema.optional(),
  couponCode: z.string().trim().max(40).optional().default(''),
  paymentMethod: z.enum(['razorpay', 'cod']),
  notes: z.string().max(500).optional().default(''),
});

export const verifyPayment = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
