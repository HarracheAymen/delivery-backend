const Order = require('../models/Order');

// 1. Créer une nouvelle commande (Client)
const createOrder = async (req, res) => {
  try {
    const { customer, restaurant, items, deliveryAddress, pricing, notes } = req.body;

    const newOrder = new Order({
      customer,
      restaurant,
      items,
      deliveryAddress,
      pricing,
      notes,
      status: 'PLACED',
    });

    const savedOrder = await newOrder.save();
    const io = req.app.get('io');

    // Broadcast à tous les livreurs connectés
    io.emit('order:new_available', {
      orderId: savedOrder._id,
      restaurant: savedOrder.restaurant,
      deliveryAddress: savedOrder.deliveryAddress,
      pricing: savedOrder.pricing,
    });

    // Pré-alerte dans la salle du restaurant
    io.to(`restaurant_${savedOrder.restaurant}`).emit('order:incoming', {
      orderId: savedOrder._id,
      items: savedOrder.items,
      status: 'AWAITING_DRIVER',
    });

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Un livreur accepte la commande -> Déclenche la cuisine !
const acceptOrderByDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    if (order.status !== 'PLACED') {
      return res.status(400).json({
        success: false,
        message: 'Cette commande a déjà été prise par un autre livreur !',
      });
    }

    order.driver = driverId;
    order.status = 'PREPARING';
    await order.save();

    const io = req.app.get('io');

    // Alerte cuisine : commencez à cuire !
    io.to(`restaurant_${order.restaurant}`).emit('kitchen:start_cooking', {
      orderId: order._id,
      driverId,
      items: order.items,
    });

    // Alerte client : livreur assigné
    io.to(`order_${order._id}`).emit('order:status_updated', {
      orderId: order._id,
      status: 'PREPARING',
      driverId,
    });

    // Retirer de l'écran des autres livreurs
    io.emit('order:taken', { orderId: order._id });

    res.json({ success: true, message: 'Course acceptée avec succès', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Mettre à jour les étapes suivantes (FOOD_READY, PICKED_UP, DELIVERED)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['FOOD_READY', 'PICKED_UP', 'ARRIVED', 'DELIVERED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    order.status = status;
    if (status === 'DELIVERED') {
      order.payment.isPaid = true; // Validé à la livraison (Cash on Delivery)
    }

    await order.save();

    const io = req.app.get('io');
    // Notifier tout le monde dans la salle de cette commande (Client, Livreur, Resto)
    io.to(`order_${order._id}`).emit('order:status_updated', {
      orderId: order._id,
      status: order.status,
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  acceptOrderByDriver,
  updateOrderStatus,
};