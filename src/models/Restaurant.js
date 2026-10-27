const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    prepTimeAverage: {
      type: Number,
      default: 20, // Temps moyen de préparation en minutes
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    addressDetails: {
      city: { type: String, required: true }, // ex: "Aïn Beïda"
      streetOrLandmark: { type: String, required: true }, // ex: "Près de la poste centrale"
    },
    categories: [
      {
        type: String, // ex: ['Fast Food', 'Pizza', 'Plats Traditionnels', 'Tacos']
      },
    ],
  },
  { timestamps: true }
);

// Index géospatial pour chercher les restaurants ou livreurs à proximité
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);