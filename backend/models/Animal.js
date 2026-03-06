// models/Animal.js
const mongoose = require("mongoose");

const AnimalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  age: { type: Number },
  status: { type: String, default: "Available" },
  image: { type: String } // optional: URL of the animal picture
});

module.exports = mongoose.model("Animal", AnimalSchema);