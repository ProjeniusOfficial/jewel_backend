import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    console.log("📩 Signup request body:", req.body);

    const { name, mobile, location, mpin, role } = req.body;

    if (!name || !mobile || !mpin) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ name, mobile, location, mpin, role });
    await newUser.save();

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("🔥 Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("📩 Login request body:", req.body);

    const { mobile, mpin } = req.body;
    if (!mobile || !mpin) {
      return res.status(400).json({ message: "Mobile and MPIN are required" });
    }

    const user = await User.findOne({ mobile, mpin });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      user,
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
