import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true, maxlength: 120 },
    body: { type: String, default: '', trim: true, maxlength: 4000 },
    images: { type: [String], default: [] },
    helpful: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ createdAt: -1 });

ReviewSchema.virtual('helpfulCount').get(function () {
  return this.helpful?.length || 0;
});

ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
