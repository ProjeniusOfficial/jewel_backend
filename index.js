// index.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// --- Route Imports ---
const authRoute = require('./routes/auth');
const ratesRoute = require('./routes/rates'); // Import the new rates route

// ... (Database connection and other middlewares are the same)
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
app.use(cors());
app.use(express.json());

// --- Route Middlewares ---
app.use('/api/auth', authRoute);
app.use('/api/rates', ratesRoute); // Tell the app to use the rates route

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
});