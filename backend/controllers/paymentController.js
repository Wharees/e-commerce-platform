const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const axios = require('axios');
const { validationResult } = require('express-validator');

/**
 * Initialize payment
 */
exports.initializePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    try {
      const paystackResponse = await axios.post(
        `${process.env.PAYSTACK_API_URL}/transaction/initialize`,
        {
          amount: order.totalAmount * 100, // Amount in kobo
          email: req.userId, // Will be replaced with user email in production
          metadata: {
            orderId: order._id,
            orderNumber: order.orderNumber
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      // Create payment record
      const payment = new Payment({
        order: order._id,
        customer: req.userId,
        amount: order.totalAmount,
        reference: paystackResponse.data.data.reference,
        status: 'pending'
      });

      await payment.save();

      res.status(200).json({
        message: 'Payment initialization successful',
        data: {
          authorization_url: paystackResponse.data.data.authorization_url,
          access_code: paystackResponse.data.data.access_code,
          reference: paystackResponse.data.data.reference
        }
      });
    } catch (paystackError) {
      return res.status(400).json({
        message: 'Failed to initialize payment',
        error: paystackError.response?.data
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    try {
      const paystackResponse = await axios.get(
        `${process.env.PAYSTACK_API_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      const { status, data } = paystackResponse.data;

      if (status && data.status === 'success') {
        // Update payment record
        const payment = await Payment.findOne({ reference });

        if (!payment) {
          return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = 'success';
        payment.paidAt = new Date();
        payment.paystackResponse = data;
        await payment.save();

        // Update order
        const order = await Order.findById(payment.order);
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        // Notify customer
        await Notification.create({
          user: payment.customer,
          type: 'payment',
          title: 'Payment Successful',
          message: `Payment for order #${order.orderNumber} has been confirmed`,
          relatedId: order._id,
          relatedModel: 'Order'
        });

        res.status(200).json({
          message: 'Payment verified successfully',
          payment
        });
      } else {
        const payment = await Payment.findOne({ reference });
        if (payment) {
          payment.status = 'failed';
          await payment.save();
        }

        res.status(400).json({
          message: 'Payment verification failed'
        });
      }
    } catch (paystackError) {
      return res.status(400).json({
        message: 'Failed to verify payment',
        error: paystackError.response?.data
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get payment by reference
 */
exports.getPaymentByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get customer payments
 */
exports.getCustomerPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ customer: req.userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments({ customer: req.userId });

    res.status(200).json({
      payments,
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
 * Get payment by order
 */
exports.getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ order: orderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Webhook for Paystack
 */
exports.webhookHandler = async (req, res) => {
  try {
    const { data, event } = req.body;

    if (event === 'charge.success') {
      const payment = await Payment.findOne({ reference: data.reference });

      if (payment) {
        payment.status = 'success';
        payment.paidAt = new Date();
        payment.paystackResponse = data;
        await payment.save();

        const order = await Order.findById(payment.order);
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        await Notification.create({
          user: payment.customer,
          type: 'payment',
          title: 'Payment Successful',
          message: `Payment for order #${order.orderNumber} has been confirmed`,
          relatedId: order._id,
          relatedModel: 'Order'
        });
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};
