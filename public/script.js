// Update time display
function updateTime() {
  const timeElement = document.querySelector(".time");
  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

// Fetch and update dashboard data
async function updateDashboard() {
  try {
    const response = await fetch("http://localhost:3000/api/dashboard");
    const data = await response.json();

    // Update temperature
    document.querySelector(
      ".temperature .value"
    ).textContent = `${data.temperature}°C`;

    // Update humidity
    document.querySelector(
      ".humidity .value"
    ).textContent = `${data.humidity}%`;

    // Update lights
    document.querySelector(".lights .value").textContent = data.activeLights;

    // Update security
    document.querySelector(".security .value").textContent = data.securityStatus
      ? "Active"
      : "Inactive";
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
}

// Fetch and display devices
async function fetchAndDisplayDevices() {
  try {
    const response = await fetch("http://localhost:3000/api/devices");
    const devices = await response.json();

    const devicesGrid = document.getElementById("devicesGrid");
    devicesGrid.innerHTML = "";

    devices.forEach((device) => {
      const deviceCard = createDeviceCard(device);
      devicesGrid.appendChild(deviceCard);
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
  }
}

// Create device card element
function createDeviceCard(device) {
  const card = document.createElement("div");
  card.className = "device-card";

  const icon = getDeviceIcon(device.type);

  card.innerHTML = `
        <div class="device-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="device-name">${device.name}</div>
        <div class="device-status">${device.status ? "Online" : "Offline"}</div>
        <div class="device-controls">
            <button onclick="toggleDevice('${device._id}', ${!device.status})">
                ${device.status ? "Turn Off" : "Turn On"}
            </button>
            <button onclick="deleteDevice('${device._id}')">Delete</button>
        </div>
    `;

  return card;
}

// Get appropriate icon for device type
function getDeviceIcon(type) {
  const icons = {
    light: "fa-lightbulb",
    temperature: "fa-thermometer-half",
    humidity: "fa-tint",
    security: "fa-shield-alt",
    default: "fa-plug",
  };
  return icons[type] || icons.default;
}

// Toggle device status
async function toggleDevice(id, newStatus) {
  try {
    const response = await fetch(`http://localhost:3000/api/devices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      updateDashboard();
      fetchAndDisplayDevices();
    }
  } catch (error) {
    console.error("Error toggling device:", error);
  }
}

// Delete device
async function deleteDevice(id) {
  if (confirm("Are you sure you want to delete this device?")) {
    try {
      const response = await fetch(`http://localhost:3000/api/devices/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        updateDashboard();
        fetchAndDisplayDevices();
      }
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  }
}

// Add new device
async function addDevice(deviceData) {
  try {
    const response = await fetch("http://localhost:3000/api/devices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceData),
    });

    if (response.ok) {
      updateDashboard();
      fetchAndDisplayDevices();
    }
  } catch (error) {
    console.error("Error adding device:", error);
  }
}

// Initialize the dashboard
function initializeDashboard() {
  updateDashboard();
  fetchAndDisplayDevices();
  // Update dashboard data every 30 seconds
  setInterval(updateDashboard, 30000);
}

// Start the dashboard when the page loads
document.addEventListener("DOMContentLoaded", initializeDashboard);
