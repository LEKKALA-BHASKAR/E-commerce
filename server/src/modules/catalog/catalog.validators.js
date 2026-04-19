import { z } from 'zod';

export const listProductsQuery = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(), // slug
  brand: z.string().trim().optional(), // can be comma-separated
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.enum(['1', '0', 'true', 'false']).optional(),
  tag: z.string().trim().optional(),
  sort: z.enum(['new', 'price-asc', 'price-desc', 'rating', 'best', 'popular']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  featured: z.enum(['1', '0']).optional(),
  bestseller: z.enum(['1', '0']).optional(),
});

export const reviewBody = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(''),
  body: z.string().trim().max(4000).optional().default(''),
});

export const suggestQuery = z.object({
  q: z.string().trim().min(1).max(80),
});
