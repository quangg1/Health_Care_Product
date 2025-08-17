const Order = require('../models/orderModel');

// Store coordinates (123 Nguyễn Huệ, Quận 1, TP.HCM - approx)
const STORE_COORDS = { lat: 10.775658, lng: 106.700424 };

function toRad(deg) { return (deg * Math.PI) / 180; }

function haversineDistance(a, b) {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sa = Math.sin(dLat / 2);
  const sb = Math.sin(dLng / 2);
  const h = sa * sa + Math.cos(lat1) * Math.cos(lat2) * sb * sb;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c; // distance in km
}

function computeShippingCost(distanceKm, subtotal) {
  // Free shipping threshold
  if (subtotal >= 500000) return 0;
  if (distanceKm <= 5) return 15000;
  if (distanceKm <= 10) return 25000;
  if (distanceKm <= 20) return 40000;
  return 60000;
}

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes,
      prescriptionImages
    } = req.body;

    const userId = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Distance-based shipping cost
    let shippingCost = 30000;
    let distanceKm = null;
    let coords = null;
    try {
      const shippingCoords = req.body.shippingCoords;
      if (shippingCoords && typeof shippingCoords.lat === 'number' && typeof shippingCoords.lng === 'number') {
        coords = { lat: shippingCoords.lat, lng: shippingCoords.lng };
        distanceKm = haversineDistance(coords, STORE_COORDS);
        shippingCost = computeShippingCost(distanceKm, subtotal);
      } else {
        // Fallback to old flat fee logic if coords not provided
        shippingCost = subtotal >= 500000 ? 0 : 30000;
      }
    } catch (e) {
      // Graceful fallback
      shippingCost = subtotal >= 500000 ? 0 : 30000;
    }

    const totalAmount = subtotal + shippingCost;

    // Estimate delivery time based on distance
    let estimatedDelivery = new Date();
    if (distanceKm === null || distanceKm <= 5) {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
    } else if (distanceKm <= 20) {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
    } else {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
    }

    // Determine payment status
    const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'paid';

    // Create order
    const order = new Order({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      notes,
      prescriptionImages: prescriptionImages || [],
      subtotal,
      shippingCost,
      totalAmount,
      shippingDistanceKm: distanceKm,
      shippingCoords: coords || { lat: null, lng: null },
      estimatedDelivery
    });

    await order.save();

    // Populate user and product details (skipped to avoid cross-service model dependency)
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user's order history
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Get order statistics (admin only)
const getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

// Reorder an existing order
const reorder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const originalOrder = await Order.findOne({ _id: orderId, user: userId });
        if (!originalOrder) {
            return res.status(404).json({ success: false, message: 'Original order not found' });
        }

        const newOrder = new Order({
            user: userId,
            items: originalOrder.items,
            shippingAddress: originalOrder.shippingAddress,
            paymentMethod: originalOrder.paymentMethod,
            notes: `Reorder of #${originalOrder._id}`,
            subtotal: originalOrder.subtotal,
            shippingCost: originalOrder.shippingCost,
            totalAmount: originalOrder.totalAmount,
        });

        await newOrder.save();

                
        res.status(201).json({
            success: true,
            message: 'Reorder successful',
            data: newOrder
        });

    } catch (error) {
        console.error('Error reordering:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating reorder',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderStatistics,
    reorder,
};