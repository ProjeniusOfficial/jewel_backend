import express from "express";
import Rates from "../models/Rates.js";

const router = express.Router();

// GET latest rates
router.get("/", async (req, res) => {
  try {
    const rates = await Rates.findOne().sort({ lastUpdated: -1 });
    if (!rates) return res.status(404).json({ message: "No rates found" });
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new rates
router.post("/", async (req, res) => {
  try {
    const { gold, silver } = req.body;
    if (!gold || !silver) {
      return res.status(400).json({ message: "Gold and Silver rates are required" });
    }

    const newRates = new Rates({
      gold,
      silver,
      lastUpdated: new Date(),
    });

    const saved = await newRates.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
