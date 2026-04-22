import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

/**
 * Ensures one SUPER_ADMIN exists (from env or defaults) and one demo product.
 */
export async function seedSuperAdmin() {
  const email = (process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.SEED_SUPER_ADMIN_NAME || 'Super Admin';
  const existing = await User.findOne({ email });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hash,
      role: 'SUPER_ADMIN',
      isVerified: true,
    });
    console.log(`Seed: Created SUPER_ADMIN ${email}`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    existing.name = name;
    existing.role = 'SUPER_ADMIN';
    existing.isVerified = true;
    existing.password = hash;
    await existing.save();
    console.log('Seed: Enforced SUPER_ADMIN role and credentials');
  }
  const seedProducts = [
    { name: '888 Margarine 500g', sku: '888-MAR500', category: 'Dairy & Cheese', brand: '888', stock: 289, price: 3.6 },
    { name: '888 Premium Palm Oil 5L', sku: '888-PO5L', category: 'Palm Oil', brand: '888', stock: 345, price: 15.9 },
    { name: '888 Premium Palm Oil 2L', sku: '888-PO2L', category: 'Palm Oil', brand: '888', stock: 263, price: 6.6 },
    { name: '888 Premium Palm Oil 1L', sku: '888-PO1L', category: 'Palm Oil', brand: '888', stock: 395, price: 3.4 },
    { name: 'Rabisco Choco Cookies 200g', sku: 'RAB-CC200', category: 'Biscuits & Cookies', brand: 'Rabisco', stock: 402, price: 2.9 },
    { name: 'Rabisco Nutty Wafer 10P', sku: 'RAB-NW10', category: 'Snacks & Nuts', brand: 'Rabisco', stock: 441, price: 2.6 },
    { name: 'Arla Full Cream Milk Powder 400g', sku: 'ARL-MPW400', category: 'Dairy & Cheese', brand: 'Arla', stock: 549, price: 7.9 },
    { name: 'Arla Unsalted Butter 200g', sku: 'ARL-BUT200', category: 'Dairy & Cheese', brand: 'Arla', stock: 296, price: 4.8 },
  ];
  const categories = ['Beverages', 'Biscuits & Cookies', 'Breakfast & Oats', 'Condiments & Spreads', 'Cooking Oils', 'Dairy & Cheese', 'Household', 'Snacks & Nuts'];
  const productCount = await Product.countDocuments();
  if (productCount < 30) {
    const existingSkus = new Set((await Product.find().select('sku')).map((product) => product.sku));
    const generatedProducts = [];
    for (let index = 0; index < 36; index += 1) {
      const baseProduct = seedProducts[index % seedProducts.length];
      const generatedSku = `${baseProduct.sku}-${String(index + 1).padStart(2, '0')}`;
      if (existingSkus.has(generatedSku)) {
        continue;
      }
      generatedProducts.push({
        name: `${baseProduct.name} Pack ${index + 1}`,
        price: Number((baseProduct.price + (index % 5) * 0.4).toFixed(2)),
        sku: generatedSku,
        category: categories[index % categories.length],
        brand: baseProduct.brand,
        stock: 30 + ((index * 13) % 560),
        description: `Wholesale ready SKU for ${baseProduct.brand} distribution.`,
      });
    }
    if (generatedProducts.length > 0) {
      await Product.insertMany(generatedProducts);
      console.log(`Seed: Added ${generatedProducts.length} wholesale products`);
    }
  }
  const shopSeeds = [
    { name: 'Seria Family Store', email: 'seria@parvati.biz', mobile: '7000000011' },
    { name: 'Tutong Trading Co', email: 'tutong@parvati.biz', mobile: '7000000012' },
    { name: 'Gadong Supermart', email: 'gadong@parvati.biz', mobile: '7000000013' },
    { name: 'Kiulap Grocery Hub', email: 'kiulap@parvati.biz', mobile: '7000000014' },
    { name: 'Al-Barakah Mart', email: 'albarakah@parvati.biz', mobile: '7000000015' },
  ];
  for (const shop of shopSeeds) {
    const shopUser = await User.findOne({ email: shop.email });
    if (!shopUser) {
      await User.create({
        name: shop.name,
        email: shop.email,
        mobile: shop.mobile,
        password: '',
        role: 'CUSTOMER',
        isVerified: true,
      });
    }
  }
  const managerEmail = 'sales.manager@parvati.biz';
  const managerExists = await User.findOne({ email: managerEmail });
  if (!managerExists) {
    const managerHash = await bcrypt.hash('Sales@12345', 10);
    await User.create({
      name: 'Sales Manager',
      email: managerEmail,
      mobile: '7000000099',
      password: managerHash,
      role: 'SALES_MANAGER',
      isVerified: true,
    });
  }
  const orderCount = await Order.countDocuments();
  if (orderCount < 12) {
    const seededOrders = [
      { customerName: 'Al-Barakah Mart', items: '888 Premium Palm Oil 5L x 3', total: 15.8, status: 'PENDING_APPROVAL' },
      { customerName: 'Al-Barakah Mart', items: '888 Premium Palm Oil 2L x 2', total: 16.92, status: 'FULFILLED' },
      { customerName: 'Tutong Trading Co', items: 'Arla Unsalted Butter 200g x 6', total: 274.26, status: 'PAID' },
      { customerName: 'Gadong Supermart', items: 'Rabisco Choco Cookies 200g x 24', total: 399, status: 'INVOICED' },
      { customerName: 'Kiulap Grocery Hub', items: 'Arla Milk Powder 400g x 20', total: 705.6, status: 'PARTIALLY_FULFILLED' },
      { customerName: 'Seria Family Store', items: '888 Margarine 500g x 50', total: 363, status: 'APPROVED' },
    ];
    await Order.insertMany(seededOrders);
    console.log(`Seed: Added ${seededOrders.length} wholesale demo orders`);
  }
}
