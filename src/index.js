const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Delivery API is running smoothly!' });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});