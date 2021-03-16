const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  symptoms: {
    type: Array,
  },
  diseases: {
    type: Array,
  },
  predictionMain: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", ResultSchema);
