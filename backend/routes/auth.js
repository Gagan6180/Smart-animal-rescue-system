const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "fureversafe_secret";

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed, role, phone });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { name: user.name, email: user.email, role: user.role, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all volunteers (admin only)
router.get("/volunteers", async (req, res) => {
    try {
        const volunteers = await User.find({ role: "volunteer" }).select("-password");
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;