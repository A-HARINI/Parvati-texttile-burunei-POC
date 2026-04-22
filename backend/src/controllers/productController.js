import { Product } from '../models/Product.js';
import { isNonEmptyString } from '../utils/validators.js';

export async function listProducts(_req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, price, sku, category, brand, stock, description, imageUrl } = req.body;
    if (!isNonEmptyString(name) || typeof price !== 'number' || !isNonEmptyString(sku)) {
      return res.status(400).json({ message: 'name, price (number), sku required' });
    }
    const product = await Product.create({
      name: name.trim(),
      price,
      sku: sku.trim(),
      category: isNonEmptyString(category) ? category.trim() : 'All Products',
      brand: isNonEmptyString(brand) ? brand.trim() : 'Parvati',
      stock: typeof stock === 'number' && stock >= 0 ? stock : 0,
      description: isNonEmptyString(description) ? description.trim() : '',
      imageUrl: isNonEmptyString(imageUrl) ? imageUrl.trim() : '',
    });
    return res.status(201).json({ product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'SKU already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { productId } = req.params;
    const { name, price, sku, category, brand, stock, description, imageUrl } = req.body;
    const updates = {};
    if (name != null) updates.name = String(name).trim();
    if (price != null) updates.price = Number(price);
    if (sku != null) updates.sku = String(sku).trim();
    if (category != null) updates.category = String(category).trim();
    if (brand != null) updates.brand = String(brand).trim();
    if (stock != null) updates.stock = Number(stock);
    if (description != null) updates.description = String(description).trim();
    if (imageUrl != null) updates.imageUrl = String(imageUrl).trim();
    const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
