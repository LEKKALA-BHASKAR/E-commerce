import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const idParam = z.object({ id: objectId });

const variant = z.object({
  sku: z.string().min(1),
  label: z.string().min(1),
  qty: z.coerce.number().nullable().optional(),
  unit: z.enum(['', 'kg', 'g', 'L', 'ml', 'pcs', 'pack']).optional().default(''),
  color: z.string().optional().default(''),
  stock: z.coerce.number().int().min(0).default(0),
  priceDelta: z.coerce.number().default(0),
});

export const productCreate = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'lowercase, hyphens only'),
  brand: z.string().optional().default(''),
  description: z.string().optional().default(''),
  category: objectId,
  price: z.coerce.number().min(0),
  compareAt: z.coerce.number().nullable().optional(),
  currency: z.string().optional().default('INR'),
  images: z.array(z.string()).optional().default([]),
  variants: z.array(variant).optional().default([]),
  stock: z.coerce.number().int().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  badges: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
});

export const productUpdate = productCreate.partial();

export const categoryCreate = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  parent: objectId.nullable().optional(),
  order: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});
export const categoryUpdate = categoryCreate.partial();

export const couponCreate = z.object({
  code: z.string().min(1).transform((s) => s.toUpperCase()),
  description: z.string().optional().default(''),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(0),
  minSubtotal: z.coerce.number().min(0).optional().default(0),
  maxDiscount: z.coerce.number().nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  usageLimit: z.coerce.number().int().nullable().optional(),
  perUserLimit: z.coerce.number().int().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});
export const couponUpdate = couponCreate.partial();

export const orderUpdate = z.object({
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().optional(),
  timelineNote: z.string().optional(),
});

export const customerUpdate = z.object({
  role: z.enum(['customer', 'editor', 'manager', 'superadmin']).optional(),
  blocked: z.boolean().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export const reviewUpdate = z.object({
  isApproved: z.boolean().optional(),
});

export const pageCreate = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  excerpt: z.string().optional().default(''),
  body: z.string().optional().default(''),
  status: z.enum(['draft', 'published', 'scheduled']).optional().default('draft'),
  publishAt: z.coerce.date().nullable().optional(),
  author: z.string().optional().default(''),
  seoTitle: z.string().optional().default(''),
  seoDescription: z.string().optional().default(''),
});
export const pageUpdate = pageCreate.partial();

export const settingsUpdate = z.object({
  values: z.record(z.string(), z.any()),
});

export const listQuery = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  role: z.string().optional(),
});
