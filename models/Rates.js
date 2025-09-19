import mongoose from "mongoose";

const RatesSchema = new mongoose.Schema({
  gold: {
    type: Number,
    required: true,
  },
  silver: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// If the model is already compiled, reuse it
const Rates = mongoose.models.Rates || mongoose.model("Rates", RatesSchema);

export default Rates;
