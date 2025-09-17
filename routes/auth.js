import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, mobile, location, mpin, role } = req.body;

    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ name, mobile, location, mpin, role });
    await newUser.save();

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { mobile, mpin } = req.body;

    const user = await User.findOne({ mobile, mpin });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", role: user.role, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
