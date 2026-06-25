const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

/**
 * Create order from cart
 */
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress, paymentMethod } = req.body;

    // Get cart
    const cart = await Cart.findOne({ customer: req.userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (let cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product ${product?.name || 'Unknown'} is no longer available`
        });
      }

      if (product.quantity < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemPrice = product.discountPrice || product.price;
      const itemTotal = itemPrice * cartItem.quantity;

      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        quantity: cartItem.quantity,
        price: itemPrice,
        totalPrice: itemTotal
      });

      totalAmount += itemTotal;

      // Reduce product quantity
      product.quantity -= cartItem.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      customer: req.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'paystack',
      totalAmount,
      status: 'pending',
      orderNumber: `LASU-${Date.now().toString().slice(-6)}` // 👈 NEW: Generates a unique number!
    });

    await order.save();

    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    // Send notifications to vendors
    for (let item of order.items) {
      await Notification.create({
        user: item.vendor,
        type: 'order',
        title: 'New Order Received',
        message: `You have a new order #${order.orderNumber}`,
        relatedId: order._id,
        relatedModel: 'Order'
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get customer orders
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { customer: req.userId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership
    if (order.customer.toString() !== req.userId) {
      // Allow vendors to see orders with their products
      const isVendor = order.items.some(
        item => item.vendor.toString() === req.userId
      );

      if (!isVendor) {
        return res.status(403).json({
          message: 'You do not have permission to view this order'
        });
      }
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update order status (Vendor)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify vendor has items in this order
    const vendorHasItems = order.items.some(
      item => item.vendor.toString() === req.userId
    );

    if (!vendorHasItems) {
      return res.status(403).json({
        message: 'You cannot update this order'
      });
    }

    order.status = status;

    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Notify customer
    await Notification.create({
      user: order.customer,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} has been ${status}`,
      relatedId: order._id,
      relatedModel: 'Order'
    });

    res.status(200).json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get vendor orders
 */
exports.getVendorOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { 'items.vendor': req.userId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel order (Customer)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();

    // Restore product quantities
    for (let item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark order as received (Customer Action)
 */
exports.markOrderAsReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify it is the actual customer who bought it
    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the buyer can confirm receipt' });
    }

    // Update the status
    order.status = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = new Date();

    await order.save();

    res.status(200).json({
      message: 'Order successfully marked as received',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
