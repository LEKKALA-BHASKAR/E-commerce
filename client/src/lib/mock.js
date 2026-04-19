// Sahara Groceries — placeholder data used by storefront + admin.
// Image URLs use verified Unsplash food photography IDs; pravatar.cc provides
// stable avatar imagery. Swap to Cloudinary in production.

const img = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const avatar = (n) => `https://i.pravatar.cc/200?img=${n}`;

// -- shared photo pools (every product gets multiple gallery shots so the PDP
//    thumbnail strip never feels empty) --------------------------------------
const RICE = [
  'photo-1586201375761-83865001e31c', // white rice in wooden bowl
  'photo-1536304929831-ee1ca9d44906', // grains close up
  'photo-1626202373052-9cdb09e9c3c1', // cooked basmati with herbs
  'photo-1568347355280-d33fdf77d42a', // rice scoop on burlap
  'photo-1596797038530-2c107229654b', // rice paddy field
  'photo-1574323347407-f5e1c0cf4b46', // oats / grains in bowl
];
const SPICES = [
  'photo-1532336414038-cf19250c5757', // spices on wooden spoons
  'photo-1599909533734-fb6e3a3aafe8', // saffron threads
  'photo-1505253716362-afaea1d3d1af', // spice jars market
  'photo-1596040033229-a9821ebd058d', // green cardamom & cinnamon
  'photo-1542990253-0d0f5be5f0ed', // turmeric powder
];
const PANTRY = [
  'photo-1474979266404-7eaacbcd87c5', // olive oil bottle on wood
  'photo-1517457373958-b7bdd4587205', // pink himalayan salt
  'photo-1601493700631-2b16ec4b4716', // medjool dates in bowl
  'photo-1604908176997-125f25cc6f3d', // pantry shelves with jars
  'photo-1542838132-92c53300491e', // grocery bag flat-lay
];
const LEGUMES = [
  'photo-1614961233913-a5113a4a34ed', // green lentils
  'photo-1515543904379-3d757afe72e4', // assorted lentils & beans
  'photo-1593251696073-5d1ad8f01b97', // chickpeas in bowl
];

export const categories = [
  { id: 'c1', slug: 'rice', name: 'Rice', image: img(RICE[0], 800), count: 14 },
  { id: 'c2', slug: 'grains', name: 'Grains', image: img(LEGUMES[1], 800), count: 12 },
  { id: 'c3', slug: 'spices', name: 'Spices', image: img(SPICES[0], 800), count: 18 },
  { id: 'c4', slug: 'pantry', name: 'Pantry', image: img(PANTRY[3], 800), count: 22 },
  { id: 'c5', slug: 'deals', name: 'Deals', image: img(SPICES[1], 800), count: 9 },
];

// Origins double as our "brand" facet for filter compatibility.
export const brands = ['India', 'Italy', 'Thailand', 'Iran', 'California', 'Spain', 'Greece'];

export const products = [
  {
    id: 'p1', slug: 'royal-basmati-rice', name: 'Royal Basmati',
    brand: 'India', categoryId: 'c1', price: 2499, compareAt: 2850,
    rating: 4.9, reviewsCount: 128, stock: 14, soldCount: 1842,
    isBestSeller: true, isFeatured: true,
    images: [img(RICE[0]), img(RICE[2]), img(RICE[1]), img(RICE[3])],
    description:
      'Aged for two years for peak aroma and exceptional grain length. Hand-graded from the Himalayan foothills, each kernel separates beautifully and triples in length when cooked.',
    variants: [
      { sku: 'RB-5KG', label: '5 kg bag', stock: 9 },
      { sku: 'RB-10KG', label: '10 kg sack', stock: 5, priceDelta: 1800 },
    ],
    tags: ['long grain', 'aged', 'aromatic'],
    badges: ['Aged 2 Years', 'Best Seller'],
  },
  {
    id: 'p2', slug: 'fragrant-jasmine-rice', name: 'Fragrant Jasmine',
    brand: 'Thailand', categoryId: 'c1', price: 1950,
    rating: 4.7, reviewsCount: 96, stock: 22, soldCount: 1204,
    isBestSeller: true, isFeatured: true,
    images: [img(RICE[3]), img(RICE[4]), img(RICE[0])],
    description:
      'Aromatic, slightly sticky texture from the rice fields of Thailand. Perfect for stir-fries, curries, and steamed sides. Sealed at source for freshness.',
    variants: [{ sku: 'JS-5KG', label: '5 kg bag', stock: 22 }],
    tags: ['long grain', 'aromatic'],
  },
  {
    id: 'p3', slug: 'arborio-superiore', name: 'Arborio Superiore',
    brand: 'Italy', categoryId: 'c1', price: 1400,
    rating: 4.6, reviewsCount: 73, stock: 18, soldCount: 612,
    isFeatured: true,
    images: [img(RICE[1]), img(RICE[5])],
    description:
      'Plump, starchy short-grain rice from the Po Valley. Absorbs broth without losing bite — the only rice that makes a true risotto alla Milanese.',
    variants: [{ sku: 'AR-2KG', label: '2 kg bag', stock: 18 }],
    tags: ['short grain', 'risotto'],
  },
  {
    id: 'p4', slug: 'brown-basmati-rice', name: 'Brown Basmati',
    brand: 'India', categoryId: 'c1', price: 2600,
    rating: 4.5, reviewsCount: 41, stock: 11, soldCount: 388,
    images: [img(RICE[1]), img(RICE[0])],
    description:
      'Nutty, whole-grain basmati with the bran intact. Higher fibre, lower glycaemic index — and still that signature long-grain fluff.',
    variants: [{ sku: 'BB-5KG', label: '5 kg bag', stock: 11 }],
    tags: ['whole grain', 'long grain'],
  },
  {
    id: 'p5', slug: 'persian-saffron-threads', name: 'Persian Saffron Threads',
    brand: 'Iran', categoryId: 'c3', price: 4500, compareAt: 5500,
    rating: 4.9, reviewsCount: 211, stock: 28, soldCount: 2310,
    isBestSeller: true, isFeatured: true,
    images: [img(SPICES[1]), img(SPICES[0]), img(SPICES[2])],
    description:
      'Coupe-grade Persian saffron, the highest quality available. Hand-harvested filaments deliver intense colour, honeyed aroma, and the unmistakable depth of true saffron.',
    variants: [
      { sku: 'SAF-2G', label: '2 grams', stock: 18 },
      { sku: 'SAF-5G', label: '5 grams', stock: 10, priceDelta: 6500 },
    ],
    tags: ['premium', 'sun-dried'],
    badges: ['Premium Grade', 'Limited'],
  },
  {
    id: 'p6', slug: 'green-cardamom-pods', name: 'Green Cardamom Pods',
    brand: 'India', categoryId: 'c3', price: 900,
    rating: 4.7, reviewsCount: 58, stock: 40, soldCount: 524,
    isFeatured: true,
    images: [img(SPICES[3]), img(SPICES[0])],
    description:
      'Whole pods from Kerala. Floral, sweet, intensely aromatic — crush gently and add to chai, biryanis, and pilafs.',
    variants: [{ sku: 'CDM-50G', label: '50 g jar', stock: 40 }],
    tags: ['whole spice', 'kerala'],
  },
  {
    id: 'p7', slug: 'cultured-ghee', name: 'Cultured Ghee',
    brand: 'India', categoryId: 'c4', price: 1450,
    rating: 4.8, reviewsCount: 134, stock: 24, soldCount: 1098,
    isBestSeller: true,
    images: [img(PANTRY[2]), img(PANTRY[3])],
    description:
      'Slow-simmered grass-fed butter, cultured for 12 hours before clarifying. Nutty, golden, with a high smoke point ideal for everyday cooking.',
    variants: [{ sku: 'GHE-470', label: '470 ml jar', stock: 24 }],
    tags: ['grass-fed', 'traditional'],
  },
  {
    id: 'p8', slug: 'pink-himalayan-salt', name: 'Pink Himalayan Salt',
    brand: 'India', categoryId: 'c4', price: 450,
    rating: 4.6, reviewsCount: 88, stock: 60, soldCount: 740,
    images: [img(PANTRY[1])],
    description:
      'Coarse-ground crystals mined from the Khewra deposits. Mineral-rich and clean tasting — perfect for grinders and finishing.',
    variants: [{ sku: 'PHS-500', label: '500 g', stock: 60 }],
    tags: ['mineral', 'coarse'],
  },
  {
    id: 'p9', slug: 'organic-medjool-dates', name: 'Organic Medjool Dates',
    brand: 'California', categoryId: 'c4', price: 1800,
    rating: 4.8, reviewsCount: 102, stock: 30, soldCount: 956,
    isBestSeller: true,
    images: [img(PANTRY[2]), img(PANTRY[4])],
    description:
      'Plump, soft Californian Medjools with deep caramel notes. Each fruit hand-selected — naturally sweet, naturally good.',
    variants: [
      { sku: 'MDJ-1LB', label: '1 lb box', stock: 30 },
      { sku: 'MDJ-3LB', label: '3 lb gift box', stock: 12, priceDelta: 3800 },
    ],
    tags: ['organic', 'whole'],
    badges: ['USDA Organic'],
  },
  {
    id: 'p10', slug: 'cold-pressed-olive-oil', name: 'Cold-Pressed Olive Oil',
    brand: 'Italy', categoryId: 'c4', price: 1950,
    rating: 4.9, reviewsCount: 156, stock: 18, soldCount: 1473,
    isBestSeller: true, isFeatured: true,
    images: [img(PANTRY[0]), img(PANTRY[3])],
    description:
      'First-press extra-virgin olive oil from a single Tuscan estate. Grassy, peppery finish — bottled within hours of harvest.',
    variants: [
      { sku: 'OO-500', label: '500 ml bottle', stock: 18 },
      { sku: 'OO-1L', label: '1 L tin', stock: 9, priceDelta: 1800 },
    ],
    tags: ['single estate', 'first extraction'],
    badges: ['Single Estate'],
  },
  {
    id: 'p11', slug: 'french-green-lentils', name: 'French Green Lentils',
    brand: 'Italy', categoryId: 'c2', price: 650,
    rating: 4.5, reviewsCount: 47, stock: 35, soldCount: 312,
    images: [img(LEGUMES[0]), img(LEGUMES[1])],
    description:
      'Du Puy-style lentils that hold their shape beautifully when cooked. Earthy, peppery, and quick-cooking — a pantry workhorse.',
    variants: [{ sku: 'FGL-500', label: '500 g', stock: 35 }],
    tags: ['lentils', 'whole'],
  },
  {
    id: 'p12', slug: 'stone-ground-flour', name: 'Stone-Ground Flour',
    brand: 'Italy', categoryId: 'c2', price: 850,
    rating: 4.6, reviewsCount: 39, stock: 22, soldCount: 268,
    images: [img(LEGUMES[2]), img(PANTRY[4])],
    description:
      'Ancient-grain wheat, milled slowly between stone wheels to preserve the germ. Rich, nutty, and unmatched for rustic breads.',
    variants: [{ sku: 'SGF-1KG', label: '1 kg bag', stock: 22 }],
    tags: ['ancient grain', 'stone-milled'],
  },
  {
    id: 'p13', slug: 'golden-sella-basmati', name: 'Golden Sella Basmati',
    brand: 'India', categoryId: 'c1', price: 1200,
    rating: 4.7, reviewsCount: 64, stock: 30, soldCount: 489,
    isFeatured: true,
    images: [img(RICE[2]), img(RICE[0])],
    description:
      'Parboiled to lock in nutrients, then aged. Extra-long grains stay separate and fluffy — ideal for biryani and pulao.',
    variants: [{ sku: 'GS-5KG', label: '5 kg bag', stock: 30 }],
    tags: ['parboiled', 'long grain'],
  },
  {
    id: 'p14', slug: 'aged-basmati-rice', name: 'Aged Basmati Rice',
    brand: 'India', categoryId: 'c5', price: 2850, compareAt: 3400,
    rating: 4.8, reviewsCount: 73, stock: 14, soldCount: 612,
    images: [img(RICE[2]), img(RICE[5])],
    description:
      'Climate-aged for 18 months in our temperature-controlled silos. Deeper aroma, longer grain, and a fluffier finish than the season fresh crop.',
    variants: [{ sku: 'ABR-5KG', label: '5 kg bag', stock: 14 }],
    tags: ['aged', 'long grain'],
    badges: ['On Sale'],
  },
];

export const heroSlides = [
  {
    id: 'h1',
    eyebrow: 'Sun-baked Harvest',
    title: 'Golden Grains, Curated for You.',
    body:
      "Discover the world's finest basmati and essential pantry staples — ethically sourced and delivered with warm simplicity to your kitchen.",
    cta: { label: 'Shop the Harvest', to: '/shop' },
    secondaryCta: { label: 'Explore Collection', to: '/shop?category=rice' },
    image: img(RICE[2], 1400),
  },
];

export const testimonials = [
  {
    id: 't1', name: 'Priya Sharma', role: 'Home Cook · Bengaluru',
    body:
      'The basmati arrives smelling like a Delhi market. Grains stay separate, the aroma is unreal. This is now my pantry staple.',
    avatar: avatar(47), rating: 5,
  },
  {
    id: 't2', name: 'Arjun Mehta', role: 'Chef · Bombay Brasserie, Mumbai',
    body:
      'I source my saffron from Sahara now. Colour, aroma, integrity — all top-tier. The kind of ingredient that makes the whole biryani.',
    avatar: avatar(12), rating: 5,
  },
  {
    id: 't3', name: 'Ananya Iyer', role: 'Food writer · Chennai',
    body:
      'Honest packaging, traceable sourcing, and the ghee is nuttier than anything at my local Nilgiris. This is how grocery should feel.',
    avatar: avatar(48), rating: 5,
  },
  {
    id: 't4', name: 'Rohan Kapoor', role: 'Restaurateur · Delhi',
    body:
      'The cold-pressed mustard oil is a revelation. Pungent, fresh, alive. We use it for finishing across the entire menu now.',
    avatar: avatar(33), rating: 5,
  },
  {
    id: 't5', name: 'Meera Pillai', role: 'Home Cook · Kochi',
    body:
      'Shipping was fast, packaging was beautiful, and the Medjool dates tasted like candy. Hard to go back to the kirana store.',
    avatar: avatar(26), rating: 4,
  },
];

// Admin demo data
export const adminKpis = [
  { label: 'Total Revenue', value: 4823100, currency: true, delta: 12.4, trend: 'up' },
  { label: 'Orders Today', value: 184, delta: 6.1, trend: 'up' },
  { label: 'New Customers', value: 47, delta: -2.8, trend: 'down' },
  { label: 'Conversion Rate', value: 3.42, suffix: '%', delta: 0.6, trend: 'up' },
];

export const revenueSeries = {
  daily: Array.from({ length: 14 }, (_, i) => ({
    label: `D${i + 1}`,
    revenue: Math.round(800000 + Math.random() * 1200000),
    orders: Math.round(40 + Math.random() * 80),
  })),
  weekly: Array.from({ length: 12 }, (_, i) => ({
    label: `W${i + 1}`,
    revenue: Math.round(4500000 + Math.random() * 6000000),
    orders: Math.round(280 + Math.random() * 420),
  })),
  monthly: Array.from({ length: 12 }, (_, i) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.round(18000000 + Math.random() * 24000000),
    orders: Math.round(1200 + Math.random() * 1800),
  })),
};

export const salesByCategory = [
  { name: 'Rice', value: 38 },
  { name: 'Spices', value: 24 },
  { name: 'Pantry', value: 18 },
  { name: 'Grains', value: 14 },
  { name: 'Deals', value: 6 },
];

export const recentOrders = [
  { id: 'SH-10428', customer: 'Eleanor Vance', email: 'eleanor@vance.co', total: 14250, status: 'Processing', items: 4, date: '2026-04-19T10:14:00Z' },
  { id: 'SH-10427', customer: 'Marcus Reyes', email: 'marcus@lupa.kitchen', total: 8900, status: 'Shipped', items: 2, date: '2026-04-19T08:42:00Z' },
  { id: 'SH-10426', customer: 'Priya Shah', email: 'priya.s@gmail.com', total: 4500, status: 'Delivered', items: 3, date: '2026-04-18T22:10:00Z' },
  { id: 'SH-10425', customer: 'Theo Laurent', email: 'theo@laurent.fr', total: 19850, status: 'Processing', items: 6, date: '2026-04-18T19:08:00Z' },
  { id: 'SH-10424', customer: 'Naomi Khoury', email: 'nkhoury@hey.com', total: 2400, status: 'Refunded', items: 1, date: '2026-04-18T15:51:00Z' },
  { id: 'SH-10423', customer: 'Idris Okafor', email: 'idris@okafor.studio', total: 5600, status: 'Delivered', items: 2, date: '2026-04-18T11:32:00Z' },
  { id: 'SH-10422', customer: 'Hannah Liu', email: 'hannah.liu@outlook.com', total: 31200, status: 'Shipped', items: 9, date: '2026-04-17T18:22:00Z' },
  { id: 'SH-10421', customer: 'Diego Ramirez', email: 'd.ramirez@protonmail.com', total: 6750, status: 'Delivered', items: 3, date: '2026-04-17T14:09:00Z' },
];

export const topProducts = products
  .slice()
  .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
  .slice(0, 5)
  .map((p) => ({
    id: p.id, name: p.name, brand: p.brand, image: p.images[0],
    price: p.price, sold: p.soldCount || 0,
  }));

export const reviewsFor = (productId) => [
  {
    id: `r1-${productId}`, author: 'Priya Sharma', avatar: avatar(47), rating: 5,
    date: '2026-03-12', title: 'Aroma jaisi maa banati thi',
    body: 'I could smell the basmati from across the room when I opened the bag. Grains stay perfectly separate and fluffy. Bilkul authentic.',
    upvotes: 24, verified: true,
  },
  {
    id: `r2-${productId}`, author: 'Arjun Mehta', avatar: avatar(12), rating: 5,
    date: '2026-02-28', title: 'Pantry staple ho gaya',
    body: 'Six weeks in and I keep reaching for this over my old brand. The aging really shows in the texture and aroma. Highly recommended for biryani.',
    upvotes: 18, verified: true,
  },
  {
    id: `r3-${productId}`, author: 'Ananya Iyer', avatar: avatar(48), rating: 4,
    date: '2026-02-18', title: 'Lovely but a bit pricey',
    body: 'No regrets, but understand you are paying for hand-graded quality. Packaging is gorgeous and the product matches. Worth it for special occasions.',
    upvotes: 9, verified: true,
  },
  {
    id: `r4-${productId}`, author: 'Rohan Kapoor', avatar: avatar(33), rating: 5,
    date: '2026-01-30', title: 'Restaurant-grade at home',
    body: 'We use this in our restaurant kitchen. Consistency batch to batch is what sets it apart from the regular kirana store options.',
    upvotes: 31, verified: true,
  },
];

// -- Admin: customers ------------------------------------------------------
export const adminCustomers = [
  { id: 'u1', name: 'Eleanor Vance', email: 'eleanor@vance.co', avatar: avatar(47), city: 'London', orders: 12, spend: 184250, status: 'VIP', joined: '2024-08-12' },
  { id: 'u2', name: 'Marcus Reyes', email: 'marcus@lupa.kitchen', avatar: avatar(12), city: 'New York', orders: 38, spend: 642100, status: 'VIP', joined: '2023-11-02' },
  { id: 'u3', name: 'Priya Shah', email: 'priya.s@gmail.com', avatar: avatar(48), city: 'Mumbai', orders: 7, spend: 38400, status: 'Active', joined: '2025-01-19' },
  { id: 'u4', name: 'Theo Laurent', email: 'theo@laurent.fr', avatar: avatar(33), city: 'Paris', orders: 21, spend: 296800, status: 'VIP', joined: '2024-03-22' },
  { id: 'u5', name: 'Naomi Khoury', email: 'nkhoury@hey.com', avatar: avatar(26), city: 'Toronto', orders: 4, spend: 18250, status: 'Active', joined: '2025-09-14' },
  { id: 'u6', name: 'Idris Okafor', email: 'idris@okafor.studio', avatar: avatar(15), city: 'Lagos', orders: 9, spend: 56700, status: 'Active', joined: '2025-04-08' },
  { id: 'u7', name: 'Hannah Liu', email: 'hannah.liu@outlook.com', avatar: avatar(38), city: 'Singapore', orders: 14, spend: 218400, status: 'VIP', joined: '2024-06-30' },
  { id: 'u8', name: 'Diego Ramirez', email: 'd.ramirez@protonmail.com', avatar: avatar(8), city: 'Madrid', orders: 6, spend: 42150, status: 'Active', joined: '2025-02-11' },
  { id: 'u9', name: 'Sara Bergman', email: 'sara.b@kth.se', avatar: avatar(5), city: 'Stockholm', orders: 2, spend: 4900, status: 'New', joined: '2026-03-28' },
  { id: 'u10', name: 'Yusuf Demir', email: 'y.demir@istanbul.tr', avatar: avatar(60), city: 'Istanbul', orders: 11, spend: 98750, status: 'Active', joined: '2024-12-04' },
  { id: 'u11', name: 'Aiko Tanaka', email: 'aiko@kanazawa.jp', avatar: avatar(20), city: 'Kanazawa', orders: 3, spend: 12400, status: 'New', joined: '2026-02-17' },
  { id: 'u12', name: 'Liam O’Connor', email: 'liam@oconnor.ie', avatar: avatar(53), city: 'Dublin', orders: 16, spend: 174200, status: 'Active', joined: '2024-05-19' },
];

// -- Admin: coupons --------------------------------------------------------
export const adminCoupons = [
  { id: 'cp1', code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, maxDiscount: 500, uses: 482, limit: 5000, expires: '2026-12-31', status: 'Active', description: '10% off for new customers' },
  { id: 'cp2', code: 'SAHARA500', type: 'fixed', value: 500, minSubtotal: 5000, maxDiscount: null, uses: 96, limit: 1000, expires: '2026-08-31', status: 'Active', description: '₹500 off orders above ₹5,000' },
  { id: 'cp3', code: 'FREESHIP', type: 'fixed', value: 99, minSubtotal: 0, maxDiscount: null, uses: 1248, limit: null, expires: '2026-06-30', status: 'Active', description: 'Free shipping on any order' },
  { id: 'cp4', code: 'BIRYANI20', type: 'percent', value: 20, minSubtotal: 2500, maxDiscount: 1000, uses: 318, limit: 2000, expires: '2026-05-31', status: 'Active', description: '20% off rice category' },
  { id: 'cp5', code: 'DIWALI25', type: 'percent', value: 25, minSubtotal: 3000, maxDiscount: 2500, uses: 0, limit: 5000, expires: '2026-11-12', status: 'Scheduled', description: 'Diwali festival promo' },
  { id: 'cp6', code: 'HARVEST50', type: 'percent', value: 50, minSubtotal: 0, maxDiscount: 5000, uses: 612, limit: 612, expires: '2026-01-15', status: 'Expired', description: 'Harvest sale, capped at 612 redemptions' },
];

// -- Admin: CMS pages ------------------------------------------------------
export const adminPages = [
  { id: 'pg1', slug: 'about', title: 'Our Story', status: 'Published', updated: '2026-03-22', author: 'Super Admin', excerpt: 'How a single sack of basmati became a pantry-first brand.' },
  { id: 'pg2', slug: 'sourcing', title: 'Sourcing & Provenance', status: 'Published', updated: '2026-04-02', author: 'Super Admin', excerpt: 'Direct relationships with growers across India, Iran, and Italy.' },
  { id: 'pg3', slug: 'shipping', title: 'Shipping & Returns', status: 'Published', updated: '2026-02-14', author: 'Manager', excerpt: 'Free over ₹999. 30-day returns on unopened pantry items.' },
  { id: 'pg4', slug: 'press', title: 'Press & Notes', status: 'Draft', updated: '2026-04-10', author: 'Editor', excerpt: 'Recent features, awards, and a few quiet wins.' },
];

// -- Admin: analytics deep dive -------------------------------------------
export const trafficSources = [
  { name: 'Direct', value: 38 },
  { name: 'Search', value: 28 },
  { name: 'Social', value: 18 },
  { name: 'Email', value: 11 },
  { name: 'Referral', value: 5 },
];

export const conversionFunnel = [
  { stage: 'Visitors', value: 24800 },
  { stage: 'Product views', value: 14620 },
  { stage: 'Add to cart', value: 5840 },
  { stage: 'Checkout', value: 2410 },
  { stage: 'Paid', value: 1284 },
];

export const ordersByHour = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}h`,
  orders: Math.round(8 + Math.abs(Math.sin((h - 6) / 3.5)) * 42 + Math.random() * 12),
}));

// -- Admin: settings defaults ---------------------------------------------
export const storeSettings = {
  general: {
    name: 'Sahara Groceries',
    email: 'hello@sahara.in',
    phone: '+91 80 4000 1234',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    address: '14 Pantry Lane, Bengaluru 560001, India',
  },
  shipping: {
    freeAbove: 999,
    flatRate: 99,
    expressRate: 249,
    countries: ['India', 'United States', 'United Kingdom', 'UAE', 'Singapore'],
  },
  payments: { razorpay: true, cod: true, stripe: false, paypal: false },
  notifications: { newOrder: true, lowStock: true, abandonedCart: false, weeklyReport: true },
};

export const adminTeam = [
  { id: 't1', name: 'Super Admin', email: 'admin@sahara.dev', role: 'superadmin', avatar: avatar(11), lastActive: '2026-04-19T09:42:00Z' },
  { id: 't2', name: 'Anika Mehta', email: 'anika@sahara.dev', role: 'manager', avatar: avatar(45), lastActive: '2026-04-19T08:15:00Z' },
  { id: 't3', name: 'Rahul Kapoor', email: 'rahul@sahara.dev', role: 'editor', avatar: avatar(13), lastActive: '2026-04-18T17:32:00Z' },
];

export const activityFeed = [
  { id: 'a1', type: 'order', text: 'Order SH-10428 placed by Eleanor Vance', amount: 14250, at: '2026-04-19T10:14:00Z' },
  { id: 'a2', type: 'review', text: 'New 5-star review on Royal Basmati', at: '2026-04-19T09:50:00Z' },
  { id: 'a3', type: 'stock', text: 'Persian Saffron Threads dipped below 30 units', at: '2026-04-19T08:32:00Z' },
  { id: 'a4', type: 'customer', text: 'Sara Bergman signed up via newsletter', at: '2026-04-19T07:18:00Z' },
  { id: 'a5', type: 'order', text: 'Order SH-10427 shipped via Bluedart', amount: 8900, at: '2026-04-19T08:42:00Z' },
  { id: 'a6', type: 'coupon', text: 'BIRYANI20 redeemed 14 times overnight', at: '2026-04-19T06:00:00Z' },
];
