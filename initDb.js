const mongoose = require("mongoose");

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/smarthome", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

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

  // Clear existing devices
  await Device.deleteMany({});
  console.log("Cleared existing devices");

  // Sample devices
  const sampleDevices = [
    {
      name: "Living Room Temperature",
      type: "temperature",
      status: true,
      value: 22,
      room: "Living Room",
    },
    {
      name: "Bedroom Humidity",
      type: "humidity",
      status: true,
      value: 45,
      room: "Bedroom",
    },
    {
      name: "Living Room Light",
      type: "light",
      status: true,
      value: 100,
      room: "Living Room",
    },
    {
      name: "Kitchen Light",
      type: "light",
      status: false,
      value: 0,
      room: "Kitchen",
    },
    {
      name: "Home Security System",
      type: "security",
      status: true,
      value: 100,
      room: "Main",
    },
  ];

  // Insert sample devices
  try {
    await Device.insertMany(sampleDevices);
    console.log("Sample devices added successfully");
  } catch (error) {
    console.error("Error adding sample devices:", error);
  }

  // Close the connection
  mongoose.connection.close();
});
