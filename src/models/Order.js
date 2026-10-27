const mongoose = require('mongoose');

// Sous-document pour stocker les éléments commandés au moment précis de l'achat
const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedOptions: [
    {
      name: String,
      extraPrice: Number,
    },
  ],
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null au départ, renseigné dès qu'un livreur accepte
    },

    items: [orderItemSchema],

    // Cycle des statuts selon notre workflow
    status: {
      type: String,
      enum: [
        'PLACED',        // Créé par le client, diffusé aux livreurs
        'PREPARING',     // Un livreur a accepté -> La cuisine commence la préparation !
        'FOOD_READY',    // Le restaurant signale que la commande est prête
        'PICKED_UP',     // Le livreur a récupéré le colis, en route vers le client
        'ARRIVED',       // Le livreur est devant chez le client
        'DELIVERED',     // Livré, paiement encaissé
        'CANCELLED',     // Annulé (si aucun livreur n'est disponible ou annulation manuelle)
      ],
      default: 'PLACED',
    },

    deliveryAddress: {
      landmark: { type: String, required: true }, // ex: "Cité 500 Logements, Bloc B"
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },

    pricing: {
      subtotal: { type: Number, required: true },    // Total des plats
      deliveryFee: { type: Number, required: true }, // Frais de livraison
      totalAmount: { type: Number, required: true }, // Total à payer
    },

    payment: {
      method: {
        type: String,
        enum: ['COD', 'BARIDIMOB'],
        default: 'COD', // Cash on Delivery par défaut
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
    },

    notes: {
      type: String,
      default: '', // Instructions particulières du client
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);