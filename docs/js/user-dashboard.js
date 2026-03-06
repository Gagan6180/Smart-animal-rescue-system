// ==========================
// User Dashboard JS
// ==========================

document.addEventListener("DOMContentLoaded", function () {
document.getElementById("sosBtn").addEventListener("click", function(){
    window.location.href = "report.html";
});

  // ============================
  // Map Initialization
  // ============================
  const mapElem = document.getElementById('map');
  if (mapElem) {
    const map = L.map('map').setView([26.1445, 91.7362], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        map.setView([lat, lng], 14);
        L.marker([lat, lng]).addTo(map).bindPopup("You are here").openPopup();

        const places = [
          { name: "Happy Paws Clinic", lat: lat + 0.01, lng: lng + 0.01 },
          { name: "Animal Rescue Center", lat: lat - 0.01, lng: lng - 0.01 },
          { name: "Vet Care Hospital", lat: lat + 0.015, lng: lng - 0.005 }
        ];
        places.forEach(p => L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.name));

      }, () => alert("Geolocation failed. Showing default location."));
    }
  }

  // ============================
  // Daily Quote
  // ============================
  const quoteTextElem = document.getElementById("quote-text");
  if (quoteTextElem) {
    fetch("https://api.quotable.io/random")
      .then(res => res.json())
      .then(data => {
        quoteTextElem.textContent = `"${data.content}" — ${data.author}`;
      })
      .catch(() => {
        quoteTextElem.textContent = "Stay pawsitive and help animals today! 🐾";
      });
  }

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
  // ✅ Use My Location Button
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

        // Try to reverse geocode for a readable address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          locationInput.value = data.display_name || `${lat}, ${lng}`;
        } catch {
          // Fallback to coordinates if reverse geocoding fails
          locationInput.value = `${lat}, ${lng}`;
        }

        getLocationBtn.textContent = "📍 Use My Location";
        getLocationBtn.disabled = false;
      },
      (error) => {
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

    localStorage.setItem("reports", JSON.stringify(reports));
  }

  // ============================
  // Submit Report with AI Check
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

    await preview.decode();
    const predictions = await model.classify(preview);
    const label = predictions[0].className.toLowerCase();
    console.log("Prediction:", label);

    if (
      !label.includes("dog") &&
      !label.includes("retriever") &&
      !label.includes("cat") &&
      !label.includes("animal")
    ) {
      alert("Please upload an image of an animal.");
      return;
    }

    saveReport();
  });

  // ============================
  // Edit Report
  // ============================
  window.editReport = function (id) {
    let reports = JSON.parse(localStorage.getItem("reports"));
    const report = reports.find(r => r.id === id);

    const newLocation = prompt("Update location:", report.location);
    if (newLocation) {
      report.location = newLocation;
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

});


document.getElementById("reportForm").addEventListener("submit", function(e){
  e.preventDefault();

  const location = document.getElementById("location").value;
  const description = document.getElementById("description").value;

  let reports = JSON.parse(localStorage.getItem("reports")) || [];

  const newReport = {
    id: Date.now(),
    location: location,
    description: description,
    status: "Submitted"
  };

  reports.push(newReport);

  localStorage.setItem("reports", JSON.stringify(reports));

  alert("Report submitted successfully!");
});