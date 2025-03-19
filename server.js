const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/smarthome", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Device Schema
const deviceSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: Boolean,
  value: Number,
  room: String,
  lastUpdated: { type: Date, default: Date.now },
});

const Device = mongoose.model("Device", deviceSchema);

// API Routes
app.get("/api/devices", async (req, res) => {
  try {
    console.log("Fetching devices...");
    const devices = await Device.find();
    console.log("Devices found:", devices);
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/devices", async (req, res) => {
  const device = new Device(req.body);
  try {
    console.log("Creating new device:", device);
    const newDevice = await device.save();
    res.status(201).json(newDevice);
  } catch (error) {
    console.error("Error creating device:", error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/devices/:id", async (req, res) => {
  try {
    console.log("Updating device:", req.params.id);
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(device);
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/devices/:id", async (req, res) => {
  try {
    console.log("Deleting device:", req.params.id);
    await Device.findByIdAndDelete(req.params.id);
    res.json({ message: "Device deleted" });
  } catch (error) {
    console.error("Error deleting device:", error);
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Data Route
app.get("/api/dashboard", async (req, res) => {
  try {
    console.log("Fetching dashboard data...");
    const devices = await Device.find();
    const dashboardData = {
      temperature: devices.find((d) => d.type === "temperature")?.value || 0,
      humidity: devices.find((d) => d.type === "humidity")?.value || 0,
      activeLights: devices.filter((d) => d.type === "light" && d.status)
        .length,
      securityStatus:
        devices.find((d) => d.type === "security")?.status || false,
    };
    console.log("Dashboard data:", dashboardData);
    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
