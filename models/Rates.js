// models/Rates.js

const mongoose = require('mongoose');

const RatesSchema = new mongoose.Schema(
    {
        goldRate: {
            twentyTwoCarat: {
                type: Number,
                required: true,
                default: 0,
            },
            twentyFourCarat: {
                type: Number,
                required: true,
                default: 0,
            },
        },
        silverRate: {
            fine: {
                type: Number,
                required: true,
                default: 0,
            },
            sterling: {
                type: Number,
                required: true,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Rates', RatesSchema);