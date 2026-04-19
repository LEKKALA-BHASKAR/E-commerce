import { Product } from '../../models/Product.js';
import { Category } from '../../models/Category.js';
import { Order } from '../../models/Order.js';
import { User } from '../../models/User.js';
import { Coupon } from '../../models/Coupon.js';
import { Review } from '../../models/Review.js';
import { Setting } from '../../models/Setting.js';
import { Page } from '../../models/Page.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

// ---------- Stats / overview ----------
export const stats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    productCount, activeProducts, lowStock,
    customerCount, newCustomers,
    orderCount, ordersToday, ordersWeek,
    revenueAgg, revenueWeekAgg,
    statusAgg,
    recent,
    topProductsAgg,
    revSeries,
  ] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lt: 10 } }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: weekAgo } }),
    Order.countDocuments({}),
    Order.countDocuments({ createdAt: { $gte: dayAgo } }),
    Order.countDocuments({ createdAt: { $gte: weekAgo } }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: weekAgo } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find({}).sort({ createdAt: -1 }).limit(8).populate('user', 'name email').lean(),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, image: { $first: '$items.image' }, slug: { $first: '$items.slug' }, sold: { $sum: '$items.qty' }, revenue: { $sum: '$items.subtotal' } } },
      { $sort: { sold: -1 } },
      { $limit: 6 },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusCounts = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));

  res.json({
    ok: true,
    stats: {
      revenue: revenueAgg[0]?.total || 0,
      revenueWeek: revenueWeekAgg[0]?.total || 0,
      orders: orderCount,
      ordersToday,
      ordersWeek,
      customers: customerCount,
      newCustomers,
      products: productCount,
      activeProducts,
      lowStock,
      statusCounts,
    },
    recentOrders: recent,
    topProducts: topProductsAgg,
    revenueSeries: revSeries.map((r) => ({ label: r._id, revenue: r.revenue, orders: r.orders })),
  });
});

// ---------- Products ----------
export const listProducts = asyncHandler(async (req, res) => {
  const { q, page, limit, sort, category } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { slug: rx }, { brand: rx }];
  }
  if (category && category !== 'all') filter.category = category;

  const sortMap = { name: { name: 1 }, price: { price: -1 }, stock: { stock: -1 }, sold: { soldCount: -1 }, new: { createdAt: -1 } };
  const sortBy = sortMap[sort] || sortMap.new;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit).populate('category', 'name slug').lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ ok: true, items, total, page, pages: Math.ceil(total / limit) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category', 'name slug').lean();
  if (!p) throw ApiError.notFound('Product not found');
  res.json({ ok: true, product: p });
});

export const createProduct = asyncHandler(async (req, res) => {
  const exists = await Product.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict('Slug already in use');
  const product = await Product.create(req.body);
  res.status(201).json({ ok: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.slug) {
    const dup = await Product.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } });
    if (dup) throw ApiError.conflict('Slug already in use');
  }
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');
  if (product.variants?.length) {
    product.recomputeStock();
    await product.save();
  }
  res.json({ ok: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw ApiError.notFound('Product not found');
  res.json({ ok: true });
});

// ---------- Categories ----------
export const listCategories = asyncHandler(async (_req, res) => {
  const cats = await Category.find({}).sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json({ ok: true, items: cats.map((c) => ({ ...c, productCount: map[String(c._id)] || 0 })) });
});

export const createCategory = asyncHandler(async (req, res) => {
  const exists = await Category.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict('Slug already in use');
  const cat = await Category.create(req.body);
  res.status(201).json({ ok: true, category: cat });
});

export const updateCategory = asyncHandler(async (req, res) => {
  if (req.body.slug) {
    const dup = await Category.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } });
    if (dup) throw ApiError.conflict('Slug already in use');
  }
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) throw ApiError.notFound('Category not found');
  res.json({ ok: true, category: cat });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) throw ApiError.conflict('Category has products. Reassign them first.');
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  res.json({ ok: true });
});

// ---------- Orders ----------
export const listOrders = asyncHandler(async (req, res) => {
  const { q, page, limit, status } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const matchedUsers = await User.find({ $or: [{ name: rx }, { email: rx }] }).select('_id').lean();
    filter.$or = [{ orderNumber: rx }, { user: { $in: matchedUsers.map((u) => u._id) } }];
  }
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ ok: true, items, total, page, pages: Math.ceil(total / limit) });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone').lean();
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ ok: true, order });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  const { status, paymentStatus, notes, timelineNote } = req.body;
  if (status && status !== order.status) {
    order.status = status;
    order.pushTimeline(status, timelineNote || '');
    if (status === 'cancelled') order.cancelledAt = new Date();
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (notes != null) order.notes = notes;
  await order.save();
  res.json({ ok: true, order });
});

// ---------- Customers ----------
export const listCustomers = asyncHandler(async (req, res) => {
  const { q, page, limit, role } = req.query;
  const filter = {};
  if (role && role !== 'all') filter.role = role;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  // Aggregate spend & order counts per user
  const ids = users.map((u) => u._id);
  const aggs = await Order.aggregate([
    { $match: { user: { $in: ids }, paymentStatus: 'paid' } },
    { $group: { _id: '$user', spend: { $sum: '$total' }, orders: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(aggs.map((a) => [String(a._id), a]));
  const items = users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    blocked: u.blocked,
    phone: u.phone || '',
    avatar: u.avatar || '',
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    orders: map[String(u._id)]?.orders || 0,
    spend: map[String(u._id)]?.spend || 0,
  }));
  res.json({ ok: true, items, total, page, pages: Math.ceil(total / limit) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id).lean();
  if (!u) throw ApiError.notFound('Customer not found');
  const orders = await Order.find({ user: u._id }).sort({ createdAt: -1 }).limit(20).lean();
  const agg = await Order.aggregate([
    { $match: { user: u._id, paymentStatus: 'paid' } },
    { $group: { _id: null, spend: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);
  res.json({
    ok: true,
    customer: {
      ...u,
      id: String(u._id),
      passwordHash: undefined,
      refreshTokens: undefined,
      resetToken: undefined,
      stats: { spend: agg[0]?.spend || 0, orders: agg[0]?.count || 0 },
      orders,
    },
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  // Guard: prevent demoting the last superadmin
  if (req.body.role && req.body.role !== 'superadmin') {
    const target = await User.findById(req.params.id).select('role').lean();
    if (target?.role === 'superadmin') {
      const remaining = await User.countDocuments({ role: 'superadmin', _id: { $ne: req.params.id } });
      if (remaining === 0) throw ApiError.badRequest('Cannot demote the last superadmin');
    }
  }
  const u = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!u) throw ApiError.notFound('Customer not found');
  res.json({ ok: true, customer: u.toSafeJSON() });
});

// ---------- Coupons ----------
export const listCoupons = asyncHandler(async (_req, res) => {
  const items = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, items });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const exists = await Coupon.findOne({ code: req.body.code });
  if (exists) throw ApiError.conflict('Code already exists');
  const c = await Coupon.create(req.body);
  res.status(201).json({ ok: true, coupon: c });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  if (req.body.code) {
    const dup = await Coupon.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
    if (dup) throw ApiError.conflict('Code already exists');
  }
  const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) throw ApiError.notFound('Coupon not found');
  res.json({ ok: true, coupon: c });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const c = await Coupon.findByIdAndDelete(req.params.id);
  if (!c) throw ApiError.notFound('Coupon not found');
  res.json({ ok: true });
});

// ---------- Reviews ----------
export const listReviews = asyncHandler(async (req, res) => {
  const { q, page, limit, status } = req.query;
  const filter = {};
  if (status === 'pending') filter.isApproved = false;
  if (status === 'approved') filter.isApproved = true;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { body: rx }, { authorName: rx }];
  }
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('product', 'name slug images').populate('user', 'name email').lean(),
    Review.countDocuments(filter),
  ]);
  res.json({ ok: true, items, total, page, pages: Math.ceil(total / limit) });
});

export const updateReview = asyncHandler(async (req, res) => {
  const r = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!r) throw ApiError.notFound('Review not found');
  res.json({ ok: true, review: r });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const r = await Review.findByIdAndDelete(req.params.id);
  if (!r) throw ApiError.notFound('Review not found');
  res.json({ ok: true });
});

// ---------- Settings (key-value) ----------
export const getSettings = asyncHandler(async (_req, res) => {
  const docs = await Setting.find({}).lean();
  const values = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  res.json({ ok: true, values });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { values } = req.body;
  const ops = Object.entries(values).map(([key, value]) =>
    Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
  );
  await Promise.all(ops);
  const docs = await Setting.find({}).lean();
  res.json({ ok: true, values: Object.fromEntries(docs.map((d) => [d.key, d.value])) });
});

// ---------- CMS Pages ----------
export const listPages = asyncHandler(async (_req, res) => {
  const items = await Page.find({}).sort({ updatedAt: -1 }).lean();
  res.json({ ok: true, items });
});

export const createPage = asyncHandler(async (req, res) => {
  const exists = await Page.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict('Slug already in use');
  const page = await Page.create({ ...req.body, author: req.user?.name || '' });
  res.status(201).json({ ok: true, page });
});

export const updatePage = asyncHandler(async (req, res) => {
  if (req.body.slug) {
    const dup = await Page.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } });
    if (dup) throw ApiError.conflict('Slug already in use');
  }
  const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!page) throw ApiError.notFound('Page not found');
  res.json({ ok: true, page });
});

export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) throw ApiError.notFound('Page not found');
  res.json({ ok: true });
});
