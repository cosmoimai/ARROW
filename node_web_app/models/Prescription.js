const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  resultId: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    required: true
  },
  user: {
    type: {
      displayName: {
        type: String
      },
      email: {
        type: String
      },
      image: {
        type: String
      }
    }
  },
  predictionMain: {
    type: Array
  },
  prescription: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
