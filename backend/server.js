// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const animalRoutes = require("./routes/animals");

const app = express();
const PORT = process.env.PORT || 5005;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Animal Rescue Backend Running");
});

// API routes
app.use("/api/animals", animalRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});