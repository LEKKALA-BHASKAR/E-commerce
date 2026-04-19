import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: '' },
    brand: { type: String, default: '' },
    sku: { type: String, default: '' },
    variantLabel: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'IN' },
  },
  { _id: false }
);

const TimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true, validate: (v) => v.length > 0 },
    shipping: { type: AddressSchema, required: true },
    billing: { type: AddressSchema, default: null },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: '' },
    tax: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
    razorpay: {
      orderId: { type: String, default: '' },
      paymentId: { type: String, default: '' },
      signature: { type: String, default: '' },
    },

    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    timeline: { type: [TimelineSchema], default: [] },
    notes: { type: String, default: '' },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OrderSchema.statics.STATUSES = ORDER_STATUSES;

OrderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    const yymm = new Date().toISOString().slice(2, 7).replace('-', '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `LX-${yymm}-${rand}`;
  }
  next();
});

OrderSchema.methods.pushTimeline = function (status, note = '') {
  this.timeline.push({ status, note, at: new Date() });
};

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
