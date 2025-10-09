// routes/auth.js

const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminNumber = "9159143736"; // The dedicated Admin Mobile Number

// REGISTER route remains the same as before...
router.post('/register', async (req, res) => {
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
            role: req.body.mobileNumber === adminNumber ? "Admin" : "User"
        });
        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN route - Finalized for Frontend Compatibility
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ mobileNumber: req.body.mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const validMpin = await bcrypt.compare(req.body.mpin, user.mpin);
        if (!validMpin) {
            return res.status(400).json({ message: "Wrong MPIN!" });
        }
        
        // Create JWT with ID and Role (needed for verifyToken middleware)
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        // Extract data, excluding sensitive MPIN
        const { mpin, mobileNumber, ...others } = user._doc;
        
        // 💡 CRITICAL FIX: Construct the final user object for the frontend.
        // We include mobileNumber directly, AND add a 'mobile' alias because 
        // the frontend console log previously showed a reliance on 'mobile'.
        const userObject = {
            ...others,
            _id: user._id, // Ensure _id is present (though usually in others)
            mobileNumber: mobileNumber, // The correct DB field name
            mobile: mobileNumber, // Alias for frontend compatibility (e.g., JoinScheme.js)
            role: user.role
        };

        // 🛑 Final Response: The access token is returned at the root level, 
        // allowing NotificationContext.js to find it using parsed.accessToken.
        res.status(200).json({ user: userObject, accessToken: accessToken });

    } catch (err) {
        console.error("Login Error:", err); 
        res.status(500).json({ message: "Internal server error" });
    }
});


// =================================================================
// --- RESET MPIN ROUTE ---
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