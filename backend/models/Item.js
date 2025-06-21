const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: String,
  foundBy: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", itemSchema);
