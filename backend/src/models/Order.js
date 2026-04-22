import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, default: '' },
    items: { type: String, default: '' },
    channel: { type: String, enum: ['CUSTOMER_PORTAL', 'SALESMAN_APP', 'ADMIN_PORTAL'], default: 'CUSTOMER_PORTAL' },
    notes: { type: String, default: '' },
    creditChecked: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SHIPPED', 'DELIVERED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'INVOICED', 'PAID', 'CANCELLED', 'PENDING'],
      default: 'PENDING_APPROVAL',
    },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
