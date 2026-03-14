// ============================
// Report Form Setup
// ============================
const reportForm = document.getElementById("reportForm");
const reportList = document.getElementById("reportList");
const imageInput = document.getElementById("animalImage");
const preview = document.getElementById("preview");

let model;

// ============================
// Load AI Model
// ============================
mobilenet.load().then(m => {
  model = m;
  console.log("AI Model Loaded");
});

// ============================
// Image Preview
// ============================
imageInput?.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
  }
});

// ============================
// Use My Location Button
// ============================
const getLocationBtn = document.getElementById("getLocation");
const locationInput = document.getElementById("location");

getLocationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  getLocationBtn.textContent = "📍 Fetching...";
  getLocationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        locationInput.value = data.display_name || `${lat}, ${lng}`;
      } catch {
        locationInput.value = `${lat}, ${lng}`;
      }

      getLocationBtn.textContent = "📍 Use My Location";
      getLocationBtn.disabled = false;
    },
    () => {
      alert("Could not get your location. Please enter it manually.");
      getLocationBtn.textContent = "📍 Use My Location";
      getLocationBtn.disabled = false;
    }
  );
});

// ============================
// Save Report
// ============================
function saveReport() {
  const report = {
    id: Date.now(),
    animal: document.getElementById("animalType").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
    urgency: document.getElementById("urgency").value,
    status: "Submitted",
    time: Date.now()
  };

  let reports = JSON.parse(localStorage.getItem("reports")) || [];
  reports.push(report);
  localStorage.setItem("reports", JSON.stringify(reports));
  loadReports();
  reportForm.reset();

  // FIX: Clear image preview after reset
  if (preview) preview.src = "";
}

// ============================
// Load Reports
// ============================
function loadReports() {
  const reports = JSON.parse(localStorage.getItem("reports")) || [];
  reportList.innerHTML = "";

  reports.forEach(report => {
    const now = Date.now();
    if (report.status === "Submitted" && now - report.time > 15000) {
      report.status = "Accepted";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${report.animal}</td>
      <td>${report.location}</td>
      <td>${report.description}</td>
      <td>${report.urgency}</td>
      <td>${report.status}</td>
      <td><button onclick="editReport(${report.id})">Edit</button></td>
    `;
    reportList.appendChild(row);
  });

  // Persist updated statuses
  localStorage.setItem("reports", JSON.stringify(reports));
}

// ============================
// Submit Report with AI Check
// FIX: Only ONE submit listener — removed the duplicate incomplete handler
// ============================
reportForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!model) {
    alert("AI model still loading. Please wait.");
    return;
  }

  if (!imageInput.files.length) {
    alert("Please upload an image first.");
    return;
  }

  // FIX: Wrap preview.decode() in try/catch in case image hasn't fully loaded
  try {
    await preview.decode();
  } catch {
    alert("Image could not be loaded. Please try a different file.");
    return;
  }

  const predictions = await model.classify(preview);
  const label = predictions[0].className.toLowerCase();
  console.log("Prediction:", label);

  // FIX: Expanded animal keyword list to cover more MobileNet ImageNet labels
  const animalKeywords = [
    "dog", "cat", "retriever", "animal", "bird", "fish", "snake",
    "horse", "cow", "elephant", "bear", "lion", "tiger", "rabbit",
    "hamster", "turtle", "frog", "deer", "wolf", "fox", "monkey",
    "parrot", "eagle", "owl", "crow", "duck", "goose", "hen",
    "rooster", "lizard", "gecko", "crocodile", "sheep", "goat",
    "pig", "donkey", "squirrel", "rat", "mouse", "bat", "otter",
    "seal", "penguin", "flamingo", "peacock", "panda", "koala"
  ];

  const isAnimal = animalKeywords.some(keyword => label.includes(keyword));

  if (!isAnimal) {
    alert("Please upload an image of an animal.");
    return;
  }

  saveReport();
  alert("Report submitted successfully!");
});

// ============================
// Edit Report
// ============================
window.editReport = function (id) {
  let reports = JSON.parse(localStorage.getItem("reports"));
  const report = reports.find(r => r.id === id);
  if (!report) return;

  const newLocation = prompt("Update location:", report.location);
  if (newLocation !== null && newLocation.trim() !== "") {
    report.location = newLocation.trim();
    localStorage.setItem("reports", JSON.stringify(reports));
    loadReports();
  }
};

// ============================
// Clear Reports
// ============================
const clearBtn = document.getElementById("clearReports");
clearBtn?.addEventListener("click", () => {
  if (confirm("Delete all reports?")) {
    localStorage.removeItem("reports");
    loadReports();
  }
});

// ============================
// Auto Refresh + Initial Load
// ============================
loadReports();
setInterval(loadReports, 3000);