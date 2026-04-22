import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

export async function listOrders(_req, res) {
  try {
    const reqUser = _req.user;
    const query = reqUser.role === 'CUSTOMER' ? { createdByUserId: reqUser.userId } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createOrder(req, res) {
  try {
    const { customerName, items, total, status, notes } = req.body;
    const user = await User.findById(req.user.userId).select('name role');
    const fallbackCustomerName = user?.name || customerName || 'Walk-in';
    const channel = req.user.role === 'CUSTOMER' ? 'CUSTOMER_PORTAL' : req.user.role === 'SALES_MANAGER' ? 'SALESMAN_APP' : 'ADMIN_PORTAL';
    const finalStatus = req.user.role === 'CUSTOMER' ? 'PENDING_APPROVAL' : status || 'PENDING_APPROVAL';
    const order = await Order.create({
      createdByUserId: req.user.userId,
      customerName: customerName || fallbackCustomerName,
      items: items || '',
      total: typeof total === 'number' ? total : 0,
      status: finalStatus,
      channel,
      notes: notes || '',
      creditChecked: req.user.role !== 'CUSTOMER',
    });
    return res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { status, customerName, items, total } = req.body;
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (req.user.role === 'CUSTOMER') {
      return res.status(403).json({ message: 'Customers cannot update order pipeline status' });
    }
    const allowedStatusesByRole = {
      SUPER_ADMIN: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'INVOICED', 'PAID', 'CANCELLED', 'SHIPPED', 'DELIVERED'],
      SALES_MANAGER: ['APPROVED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'INVOICED', 'PAID', 'SHIPPED', 'DELIVERED'],
    };
    const updates = {};
    if (status) {
      const allowedStatuses = allowedStatusesByRole[req.user.role] || [];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ message: `Role ${req.user.role} cannot set status ${status}` });
      }
      updates.status = status;
    }
    if (customerName != null) updates.customerName = customerName;
    if (items != null) updates.items = items;
    if (total != null) updates.total = Number(total);
    const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
    return res.json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteOrder(req, res) {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** Users with role CUSTOMER (for sales / super admin dashboards). */
export async function listCustomers(_req, res) {
  try {
    const customers = await User.find({ role: 'CUSTOMER' }).select('name email mobile city tier creditLimit createdAt').sort({ createdAt: -1 });
    return res.json({ customers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
