const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * Get user's cart
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.userId });

    if (!cart) {
      cart = new Cart({ customer: req.userId, items: [] });
      await cart.save();
    }

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add item to cart
 */
exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        message: `Only ${product.quantity} items available`
      });
    }

    let cart = await Cart.findOne({ customer: req.userId });

    if (!cart) {
      cart = new Cart({ customer: req.userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();

    res.status(200).json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update cart item quantity
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const product = await Product.findById(productId);
    if (!product || product.quantity < quantity) {
      return res.status(400).json({
        message: `Only ${product?.quantity || 0} items available`
      });
    }

    const cart = await Cart.findOne({ customer: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.product.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: 'Cart item updated',
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Remove item from cart (Ghostbuster Edition 👻🔫)
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // We bypass Mongoose array tracking and tell MongoDB directly to $pull (delete) the item
    const cart = await Cart.findOneAndUpdate(
      { customer: req.userId },
      { $pull: { items: { product: productId } } },
      { new: true } // This returns the updated, ghost-free cart
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({
      message: 'Item permanently removed from database',
      cart
    });
  } catch (error) {
    console.error("Database deletion failed:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Clear cart
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get cart count
 */
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.userId });

    const count = cart ? cart.items.length : 0;

    res.status(200).json({ count });
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
