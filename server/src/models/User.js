import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    region: String,
    postalCode: String,
    country: { type: String, default: 'US' },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['customer', 'editor', 'manager', 'superadmin'],
      default: 'customer',
      index: true,
    },
    avatar: String,
    phone: String,
    addresses: { type: [AddressSchema], default: [] },
    blocked: { type: Boolean, default: false },
    refreshTokens: { type: [String], default: [], select: false },
    resetToken: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

UserSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    phone: this.phone,
    addresses: this.addresses,
    blocked: this.blocked,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', UserSchema);
