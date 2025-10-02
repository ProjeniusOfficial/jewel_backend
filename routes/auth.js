// routes/auth.js

const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER route remains the same as before...
router.post('/register', async (req, res) => {
    // ... no changes needed here
    try {
        const existingUser = await User.findOne({ mobileNumber: req.body.mobileNumber });
        if (existingUser) {
            return res.status(409).json("A user with this mobile number already exists.");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedMpin = await bcrypt.hash(req.body.mpin, salt);
        const newUser = new User({
            name: req.body.name,
            mobileNumber: req.body.mobileNumber,
            location: req.body.location,
            mpin: hashedMpin,
        });
        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN route is updated
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ mobileNumber: req.body.mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found!" }); // Changed to JSON for consistency
        }

        const validMpin = await bcrypt.compare(req.body.mpin, user.mpin);
        if (!validMpin) {
            return res.status(400).json({ message: "Wrong MPIN!" }); // Changed to JSON for consistency
        }
        
        // **UPDATED**: Include user role in the JWT payload
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, // ADDED ROLE HERE
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        const { mpin, ...others } = user._doc;

        res.status(200).json({ ...others, accessToken });

    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: "Internal server error" });
    }
});


// =================================================================
// --- NEW: RESET MPIN ROUTE ---
// =================================================================
router.post('/reset-mpin', async (req, res) => {
    const { mobileNumber, newMpin } = req.body;

    // Basic validation
    if (!mobileNumber || !newMpin || newMpin.length !== 4) {
        return res.status(400).json({ message: "Valid 10-digit mobile number and 4-digit MPIN are required." });
    }

    try {
        // Find the user by mobile number
        const user = await User.findOne({ mobileNumber: mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "User with this mobile number not found." });
        }

        // Hash the new MPIN
        const salt = await bcrypt.genSalt(10);
        const hashedMpin = await bcrypt.hash(newMpin, salt);

        // Update the user's MPIN and save
        user.mpin = hashedMpin;
        await user.save();

        res.status(200).json({ message: "MPIN has been reset successfully." });

    } catch (error) {
        console.error("Error resetting MPIN:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});


module.exports = router;
