const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true, // Prix en DZD
    },
    category: {
      type: String,
      required: true, // ex: "Plats", "Sandwichs", "Boissons"
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true, // Pour activer ou désactiver si le stock est épuisé
    },
    options: [
      {
        name: { type: String }, // ex: "Sauce Algérienne", "Fromage supplémentaire"
        extraPrice: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);