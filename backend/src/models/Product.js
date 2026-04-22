import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'All Products', trim: true },
    brand: { type: String, default: 'Parvati', trim: true },
    stock: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
