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
            return res.status(404).json("User not found!");
        }

        const validMpin = await bcrypt.compare(req.body.mpin, user.mpin);
        if (!validMpin) {
            return res.status(400).json("Wrong MPIN!");
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
        res.status(500).json(err);
    }
});

module.exports = router;