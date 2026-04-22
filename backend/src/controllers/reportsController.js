import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

/** GET /api/reports/summary — SUPER_ADMIN (full); optional SALES_MANAGER subset via route */
export async function adminSummary(_req, res) {
  try {
    const [userCount, productCount, orderCount, pendingOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'PENDING' }),
    ]);
    return res.json({
      summary: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        pendingOrders,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
