const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'driver', 'restaurant_owner', 'admin'],
      default: 'customer',
    },
    // Driver-specific details
    driverProfile: {
      vehicleType: { type: String, enum: ['moto', 'car', 'bicycle'], default: 'moto' },
      isOnline: { type: Boolean, default: false },
      currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },
    savedAddresses: [
      {
        label: { type: String, default: 'Home' }, // e.g. "Maison", "Travail"
        landmark: { type: String, required: true }, // e.g. "Cité 500 Logements"
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index so we can locate drivers near restaurants
userSchema.index({ 'driverProfile.currentLocation': '2dsphere' });

module.exports = mongoose.model('User', userSchema);
