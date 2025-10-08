const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// --- Route Imports ---
const authRoute = require('./routes/auth');
const ratesRoute = require('./routes/rates');
const paymentRoute = require('./routes/payment'); 
const notificationRoute = require('./routes/notification'); // 💡 NEW: Import the notification routes

// --- Initializations ---
const app = express();
dotenv.config();

// --- Database Connection ---
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connection Successful!'))
    .catch((err) => {
        console.error('MongoDB Connection Failed:', err);
    });

// --- Middlewares ---
// Using explicit CORS configuration for better compatibility
app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));
app.use(express.json());

// --- Route Middlewares ---
app.use('/api/auth', authRoute);
app.use('/api/rates', ratesRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/notifications', notificationRoute); // 💡 NEW: Use the notification routes

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
});
