// routes/rates.js

const router = require('express').Router();
const Rates = require('../models/Rates');
const { verifyTokenAndAdmin } = require('../middleware/verifyToken');

// GET CURRENT RATES (No changes needed)
router.get("/", async (req, res) => {
    try {
        let rates = await Rates.findOne();
        if (!rates) {
            rates = await new Rates().save();
        }
        res.status(200).json(rates);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE RATES (Admin Only) - MODIFIED FOR BOTH GOLD AND SILVER
router.put("/update", verifyTokenAndAdmin, async (req, res) => {
    try {
        // Prepare the complete update object from the request body
        const updateData = {
            goldRate: {
                twentyTwoCarat: req.body.goldRate.twentyTwoCarat,
                twentyFourCarat: req.body.goldRate.twentyFourCarat,
            },
            silverRate: {
                fine: req.body.silverRate.fine,
                sterling: req.body.silverRate.sterling,
            },
        };

        // Find the single rates document and update it with the new values
        const updatedRates = await Rates.findOneAndUpdate(
            {}, // Find the first document
            { $set: updateData }, // Apply the new data
            { new: true, upsert: true } // Options: return the new doc, and create if it doesn't exist
        );
        res.status(200).json(updatedRates);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;