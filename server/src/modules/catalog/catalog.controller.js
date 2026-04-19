import { Category } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { Review } from '../../models/Review.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

// ---------- Categories ----------
export const listCategories = asyncHandler(async (_req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  // Build tree
  const byId = new Map(cats.map((c) => [String(c._id), { ...c, children: [] }]));
  const roots = [];
  for (const c of byId.values()) {
    if (c.parent && byId.has(String(c.parent))) {
      byId.get(String(c.parent)).children.push(c);
    } else {
      roots.push(c);
    }
  }
  res.json({ ok: true, categories: roots, flat: cats });
});

// ---------- Products ----------
const sortMap = {
  new: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { ratingAvg: -1, ratingCount: -1 },
  best: { isBestSeller: -1, soldCount: -1 },
  popular: { soldCount: -1 },
};

export const listProducts = asyncHandler(async (req, res) => {
  const q = req.query;
  const filter = { isActive: true };

  if (q.category) {
    const cat = await Category.findOne({ slug: q.category }).lean();
    if (cat) filter.category = cat._id;
    else return res.json({ ok: true, items: [], page: 1, pages: 0, total: 0 });
  }
  if (q.brand) {
    const brands = q.brand.split(',').map((b) => b.trim()).filter(Boolean);
    if (brands.length) filter.brand = { $in: brands };
  }
  if (q.minPrice != null || q.maxPrice != null) {
    filter.price = {};
    if (q.minPrice != null) filter.price.$gte = q.minPrice;
    if (q.maxPrice != null) filter.price.$lte = q.maxPrice;
  }
  if (q.rating) filter.ratingAvg = { $gte: q.rating };
  if (q.inStock === '1' || q.inStock === 'true') filter.stock = { $gt: 0 };
  if (q.tag) filter.tags = q.tag;
  if (q.featured === '1') filter.isFeatured = true;
  if (q.bestseller === '1') filter.isBestSeller = true;
  if (q.q) filter.$text = { $search: q.q };

  const sort = sortMap[q.sort] || sortMap.new;
  const page = q.page || 1;
  const limit = q.limit || 24;
  const skip = (page - 1) * limit;

  const [items, total, brandsAgg] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug').lean(),
    Product.countDocuments(filter),
    Product.distinct('brand', { isActive: true }),
  ]);

  res.json({
    ok: true,
    items,
    page,
    pages: Math.ceil(total / limit),
    total,
    facets: { brands: brandsAgg.filter(Boolean).sort() },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .lean();
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ ok: true, product });
});

export const getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean();
  if (!product) throw ApiError.notFound('Product not found');
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .sort({ ratingAvg: -1, soldCount: -1 })
    .limit(8)
    .lean();
  res.json({ ok: true, items: related });
});

export const suggest = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ ok: true, items: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const items = await Product.find({
    isActive: true,
    $or: [{ name: rx }, { brand: rx }, { tags: rx }],
  })
    .select('name slug brand price images')
    .limit(8)
    .lean();
  res.json({ ok: true, items });
});

// ---------- Reviews ----------
export const listReviews = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).select('_id').lean();
  if (!product) throw ApiError.notFound('Product not found');
  const reviews = await Review.find({ product: product._id, isApproved: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({
    ok: true,
    reviews: reviews.map((r) => ({ ...r, helpfulCount: r.helpful?.length || 0, helpful: undefined })),
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw ApiError.notFound('Product not found');
  const { rating, title, body } = req.body;

  const existing = await Review.findOne({ product: product._id, user: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    authorName: req.user.name,
    rating,
    title,
    body,
  });

  // Recompute aggregate
  const agg = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  product.ratingAvg = agg[0]?.avg || 0;
  product.ratingCount = agg[0]?.count || 0;
  await product.save();

  res.status(201).json({ ok: true, review });
});

export const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  const uid = req.user._id;
  const idx = review.helpful.findIndex((u) => String(u) === String(uid));
  if (idx >= 0) review.helpful.splice(idx, 1);
  else review.helpful.push(uid);
  await review.save();
  res.json({ ok: true, helpfulCount: review.helpful.length, isHelpful: idx < 0 });
});
