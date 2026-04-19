import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
