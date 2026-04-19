import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { env, flags } from '../config/env.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { categoriesData, productsData } from './catalog-data.js';

const FORCE = process.argv.includes('--force');

async function seedAdmin() {
  try {
    await User.collection.dropIndex('id_1');
    console.log('[seed] dropped legacy users.id_1 index');
  } catch (e) {
    if (e?.codeName !== 'IndexNotFound') throw e;
  }
  let admin = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (!admin) {
    admin = new User({ name: 'Super Admin', email: env.SEED_ADMIN_EMAIL, role: 'superadmin' });
    await admin.setPassword(env.SEED_ADMIN_PASSWORD);
    await admin.save();
    console.log(`[seed] Created super admin: ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
  } else {
    console.log(`[seed] Super admin exists: ${env.SEED_ADMIN_EMAIL}`);
  }
}

async function seedCatalog() {
  if (FORCE) {
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('[seed] Cleared categories + products (--force)');
  }

  const slugToId = new Map();
  for (const c of categoriesData) {
    const cat = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: c },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    slugToId.set(c.slug, cat._id);
  }
  console.log(`[seed] Categories: ${slugToId.size}`);

  let created = 0;
  let updated = 0;
  for (const p of productsData) {
    const { categorySlug, ...rest } = p;
    const category = slugToId.get(categorySlug);
    if (!category) {
      console.warn(`[seed] Skipping ${p.slug} — category ${categorySlug} not found`);
      continue;
    }
    const stock = (rest.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
    const doc = { ...rest, category, stock };
    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: doc });
      updated++;
    } else {
      await Product.create(doc);
      created++;
    }
  }
  console.log(`[seed] Products created: ${created}, updated: ${updated}, total: ${productsData.length}`);
}

async function seedCoupons() {
  const coupons = [
    { code: 'WELCOME10', type: 'percent', value: 10, description: '10% off your first order', minSubtotal: 0, maxDiscount: 500 },
    { code: 'SAHARA500', type: 'fixed', value: 500, description: '₹500 off orders above ₹5000', minSubtotal: 5000 },
    { code: 'FREESHIP', type: 'fixed', value: 99, description: 'Free shipping on any order', minSubtotal: 0 },
  ];
  for (const c of coupons) {
    await Coupon.findOneAndUpdate({ code: c.code }, { $set: c }, { upsert: true, setDefaultsOnInsert: true });
  }
  console.log(`[seed] Coupons: ${coupons.length}`);
}

const REVIEWERS = [
  { name: 'Priya Sharma', email: 'priya.sharma@sahara.demo' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@sahara.demo' },
  { name: 'Ananya Iyer', email: 'ananya.iyer@sahara.demo' },
  { name: 'Rohan Kapoor', email: 'rohan.kapoor@sahara.demo' },
  { name: 'Meera Pillai', email: 'meera.pillai@sahara.demo' },
  { name: 'Vikram Singh', email: 'vikram.singh@sahara.demo' },
  { name: 'Kavya Reddy', email: 'kavya.reddy@sahara.demo' },
  { name: 'Aditya Verma', email: 'aditya.verma@sahara.demo' },
];

const REVIEW_TEMPLATES = [
  { rating: 5, title: 'Bilkul authentic!', body: 'The aroma when I opened the pack reminded me of my grandmother\'s kitchen. Quality is genuinely top-tier and packaging is sealed properly. Will reorder for sure.' },
  { rating: 5, title: 'Worth every rupee', body: 'I have tried many brands but this one stands apart. Fresh, clean, and the texture is exactly what you want. My family loved it.' },
  { rating: 4, title: 'Very good, slight delay in delivery', body: 'Product quality is excellent — exactly as described. Delivery took a day extra but the packaging was intact. Would recommend.' },
  { rating: 5, title: 'Best basmati I have bought online', body: 'Long grains, beautiful aroma after cooking, no broken pieces. Pulao came out restaurant-style. Loving it.' },
  { rating: 5, title: 'Pure quality, single origin', body: 'You can taste the difference vs supermarket brands. Bohot accha experience raha. Customer support was also helpful.' },
  { rating: 4, title: 'Good but slightly pricey', body: 'Quality justifies the price for special occasions. For everyday use I might still go with my regular brand, but for festivals — yes!' },
  { rating: 5, title: 'My new pantry staple', body: 'Already on my second order. Friends asked where I got it from after tasting the biryani I made. Highly recommended.' },
  { rating: 5, title: 'Perfect for festive cooking', body: 'Bought this for Diwali prep. Absolutely no complaints — colour, aroma, and freshness all on point. Sahara has a loyal customer now.' },
  { rating: 4, title: 'Solid product, premium feel', body: 'Packaging feels premium and the product inside lives up to it. Loved the resealable pouch — keeps everything fresh.' },
  { rating: 5, title: 'Refreshingly honest brand', body: 'Single-origin claim feels real here. Aroma and flavour are noticeably different from blended supermarket products.' },
];

async function seedReviewers() {
  const created = [];
  for (const r of REVIEWERS) {
    let u = await User.findOne({ email: r.email });
    if (!u) {
      u = new User({ name: r.name, email: r.email, role: 'customer' });
      await u.setPassword('Demo@1234');
      await u.save();
    }
    created.push(u);
  }
  console.log(`[seed] Reviewers: ${created.length}`);
  return created;
}

function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function seedReviews(reviewers) {
  const products = await Product.find({}).select('_id name').lean();
  let created = 0;
  for (const p of products) {
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 per product
    const chosenUsers = pick(reviewers, Math.min(count, reviewers.length));
    const tpls = pick(REVIEW_TEMPLATES, chosenUsers.length);
    for (let i = 0; i < chosenUsers.length; i++) {
      const u = chosenUsers[i];
      const t = tpls[i];
      try {
        const exists = await Review.findOne({ product: p._id, user: u._id });
        if (exists) continue;
        await Review.create({
          product: p._id,
          user: u._id,
          authorName: u.name,
          rating: t.rating,
          title: t.title,
          body: t.body,
          isApproved: true,
        });
        created++;
      } catch (e) {
        if (e.code !== 11000) throw e;
      }
    }
    // Recompute aggregates
    const agg = await Review.aggregate([
      { $match: { product: p._id, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count: ratingCount = 0 } = agg[0] || {};
    await Product.updateOne({ _id: p._id }, { $set: { ratingAvg: Math.round(avg * 10) / 10, ratingCount } });
  }
  console.log(`[seed] Reviews created: ${created} across ${products.length} products`);
}

async function run() {
  if (!flags.hasMongo) {
    console.error('[seed] MONGODB_URI not set. Aborting.');
    process.exit(1);
  }
  await connectDB();
  await seedAdmin();
  await seedCatalog();
  await seedCoupons();
  const reviewers = await seedReviewers();
  await seedReviews(reviewers);
  console.log('[seed] Done.');
  process.exit(0);
}

run().catch((e) => {
  console.error('[seed] failed:', e);
  process.exit(1);
});
