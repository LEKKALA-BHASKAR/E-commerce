import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    qty: { type: Number, default: null },
    unit: { type: String, default: '', enum: ['', 'kg', 'g', 'L', 'ml', 'pcs', 'pack'] },
    color: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
    priceDelta: { type: Number, default: 0 },
  },
  { _id: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    brand: { type: String, default: '', index: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null },
    currency: { type: String, default: 'USD' },
    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    badges: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ ratingAvg: -1 });

ProductSchema.methods.recomputeStock = function () {
  if (this.variants?.length) {
    this.stock = this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
};

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
