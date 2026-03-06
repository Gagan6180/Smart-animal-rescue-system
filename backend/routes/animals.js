// routes/animals.js
const express = require("express");
const router = express.Router();
const Animal = require("../models/Animal");

// GET all animals
router.get("/", async (req, res) => {
  try {
    const animals = await Animal.find();
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new animal (optional for adding animals)
router.post("/", async (req, res) => {
  try {
    const animal = new Animal(req.body);
    await animal.save();
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;