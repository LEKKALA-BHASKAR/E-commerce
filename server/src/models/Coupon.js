import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: null }, // cap for percent coupons
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null }, // total uses across all users
    perUserLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.methods.computeDiscount = function (subtotal) {
  let d = this.type === 'percent' ? (subtotal * this.value) / 100 : this.value;
  if (this.maxDiscount != null) d = Math.min(d, this.maxDiscount);
  return Math.max(0, Math.min(subtotal, +d.toFixed(2)));
};

CouponSchema.methods.isCurrentlyValid = function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startsAt && now < this.startsAt) return false;
  if (this.expiresAt && now > this.expiresAt) return false;
  if (this.usageLimit != null && this.usedCount >= this.usageLimit) return false;
  return true;
};

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
