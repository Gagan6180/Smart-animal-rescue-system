const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const app = express();
const PORT = process.env.PORT || 5005;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const animalRoutes = require("./routes/animals");
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");

app.use("/api/animals", animalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("FurEver Safe Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});