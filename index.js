// index.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// --- Route Imports ---
const authRoute = require('./routes/auth');
const ratesRoute = require('./routes/rates');

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
// --- CHANGE: Made CORS configuration more explicit ---
// This ensures that all origins and methods (GET, POST, PUT, etc.) are allowed.
app.use(cors({
  origin: "*", // Allow requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow all standard methods
}));

app.use(express.json());

// --- Route Middlewares ---
app.use('/api/auth', authRoute);
app.use('/api/rates', ratesRoute);

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
});