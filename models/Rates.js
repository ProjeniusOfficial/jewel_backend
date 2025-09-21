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
        // --- CHANGE: Updated silverRate schema to match goldRate structure ---
        silverRate: {
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
    },
    { timestamps: true }
);

module.exports = mongoose.model('Rates', RatesSchema);
