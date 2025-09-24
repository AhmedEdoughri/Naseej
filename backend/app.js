const express = require("express");
const cors = require("cors");

// Import your route files
const authRoutes = require("./src/routes/authRoutes");
const storesRoutes = require("./src/routes/storesRoutes");
const pickupsRoutes = require("./src/routes/pickupsRoutes");
const itemsRoutes = require("./src/routes/itemsRoutes");
const usersRoutes = require("./src/routes/usersRoutes");
const statusRoutes = require("./src/routes/statusRoutes");
const reportsRoutes = require("./src/routes/reportsRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const contactRoutes = require("./src/routes/contactRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/pickups", pickupsRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/statuses", statusRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);

module.exports = app;
