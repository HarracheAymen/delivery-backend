const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    driverProfile: {
      vehicleType: { type: String, enum: ['moto', 'car', 'bicycle'], default: 'moto' },
      isOnline: { type: Boolean, default: false },
      currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    savedAddresses: [
      {
        label: { type: String, default: 'Home' },
        landmark: { type: String, required: true },
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], required: true },
        },
      },
    ],
  },
  { timestamps: true }
);

// Hash password automatically before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to check password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ 'driverProfile.currentLocation': '2dsphere' });

module.exports = mongoose.model('User', userSchema);