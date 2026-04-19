import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '' },
    body: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft', index: true },
    publishAt: { type: Date, default: null },
    author: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Page = mongoose.models.Page || mongoose.model('Page', PageSchema);
