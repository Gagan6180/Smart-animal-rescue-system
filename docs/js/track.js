// ============================
// LOAD REPORT FROM LOCALSTORAGE
// ============================
const reports = JSON.parse(localStorage.getItem("reports")) || [];
const report = reports.length ? reports[reports.length - 1] : null;

const statusBanner   = document.getElementById("statusBanner");
const noReportState  = document.getElementById("noReportState");
const pendingState   = document.getElementById("pendingState");
const rejectedState  = document.getElementById("rejectedState");
const acceptedState  = document.getElementById("acceptedState");

// Auto-transition: mark as Accepted after 15 seconds
if (report && report.status === "Submitted" && Date.now() - report.time > 15000) {
  report.status = "Accepted";
  report.volunteer = { name: "Rahul Sharma", phone: "+91 98765 43210" };
  localStorage.setItem("reports", JSON.stringify(reports));
}

// ============================
// RENDER CORRECT STATE
// ============================
function render() {
  if (!report) {
    showBanner("none");
    noReportState.style.display = "block";
    return;
  }

  if (report.status === "Submitted") {
    showBanner("pending");
    pendingState.style.display = "block";

    // Fill pending preview with real report data
    document.getElementById("pendingPreview").innerHTML = `
      <p><span>Animal:</span> ${report.animal || "—"}</p>
      <p><span>Location:</span> ${report.location || "—"}</p>
      <p><span>Urgency:</span> ${report.urgency || "—"}</p>
    `;

    // Keep polling every 5 seconds to catch the 15s auto-accept
    setTimeout(() => location.reload(), 5000);
    return;
  }

  if (report.status === "Rejected") {
    showBanner("rejected");
    rejectedState.style.display = "block";
    return;
  }

  if (report.status === "Accepted") {
    showBanner("accepted");
    acceptedState.style.display = "block";

    // Populate summary table with real report data
    document.getElementById("summaryAnimal").textContent   = report.animal   || "—";
    document.getElementById("summaryLocation").textContent = report.location || "—";

    const urgencyEl = document.getElementById("summaryUrgency");
    urgencyEl.textContent = report.urgency || "—";
    if (report.urgency && report.urgency.toLowerCase() === "high") {
      urgencyEl.innerHTML = "🔴 High";
      urgencyEl.classList.add("urgency-high");
    } else if (report.urgency && report.urgency.toLowerCase() === "medium") {
      urgencyEl.innerHTML = "🟠 Medium";
    } else {
      urgencyEl.innerHTML = "🟢 " + (report.urgency || "—");
    }

    initETA();
    initMap();
    initChat();
  }
}

// ============================
// BANNER HELPER
// ============================
function showBanner(type) {
  const banners = {
    none: {
      bg: "#aaa",
      html: `<h1>📭 No Active Reports</h1><p>Submit a report to start tracking.</p>`
    },
    pending: {
      bg: "#f0a500",
      html: `<div class="badge"><div class="pulse-dot"></div> Waiting</div>
             <h1>⏳ Looking for a Volunteer...</h1>
             <p>Your report is submitted. Please wait while a volunteer accepts it.</p>`
    },
    rejected: {
      bg: "#ff4d4d",
      html: `<h1>❌ Request Rejected</h1><p>Please re-submit your report with more details.</p>`
    },
    accepted: {
      bg: "#20C997",
      html: `<div class="badge"><div class="pulse-dot"></div> Live Update</div>
             <h1>🐾 Volunteer is on the way!</h1>
             <p>Your rescue request has been accepted. Help is coming.</p>`
    }
  };

  const b = banners[type];
  statusBanner.style.backgroundColor = b.bg;
  statusBanner.innerHTML = b.html;
}

// ============================
// ETA COUNTDOWN
// ============================
function initETA() {
  let totalSeconds = 8 * 60 + 42;
  const etaEl = document.getElementById("etaTimer");

  const etaInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      etaEl.textContent = "00:00";
      clearInterval(etaInterval);
      return;
    }
    totalSeconds--;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    etaEl.textContent = `${m}:${s}`;
  }, 1000);
}

// ============================
// LEAFLET MAP
// ============================
function initMap() {
  const userLat = 26.1445, userLng = 91.7362;
  let volLat = 26.1478, volLng = 91.7298;

  const map = L.map("map").setView([userLat, userLng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  const userIcon = L.divIcon({
    html: `<div style="background:#ff4d4d;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7], className: ""
  });
  const volIcon = L.divIcon({
    html: `<div style="background:#20C997;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8], className: ""
  });

  L.marker([userLat, userLng], { icon: userIcon })
    .addTo(map).bindPopup("🐾 Incident Location").openPopup();

  const volMarker = L.marker([volLat, volLng], { icon: volIcon })
    .addTo(map).bindPopup("🧑 Tusshar Singh");

  L.polyline([[userLat, userLng], [volLat, volLng]], {
    color: "#20C997", weight: 2, dashArray: "6,6", opacity: 0.7
  }).addTo(map);

  setInterval(() => {
    volLat += (userLat - volLat) * 0.04;
    volLng += (userLng - volLng) * 0.04;
    volMarker.setLatLng([volLat, volLng]);
  }, 5000);
}

// ============================
// CHAT SYSTEM
// ============================
function initChat() {
  const chatWindow = document.getElementById("chatWindow");
  const chatInput  = document.getElementById("chatInput");

  const volunteerReplies = [
    "Got it, I'll look for that landmark. Thanks!",
    "On my way, should be there shortly. 🚗",
    "Is the animal injured or just stray?",
    "Please stay near the location if possible.",
    "I've rescued animals from this area before. Don't worry! 🐾",
    "About 5 minutes away now.",
    "Can you see me on the map? I'm the green dot.",
  ];
  let replyIndex = 0;

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addMessage(text, type, sender) {
    const msg = document.createElement("div");
    msg.className = `msg ${type}`;
    msg.innerHTML = `
      ${type === "received" ? `<div class="msg-sender">${sender}</div>` : ""}
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">${getTime()}</div>
    `;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "msg received";
    t.id = "typingIndicator";
    t.innerHTML = `
      <div class="msg-sender">Tusshar Singh</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatWindow.appendChild(t);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("typingIndicator");
    if (t) t.remove();
  }

  window.sendMessage = function () {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, "sent", "You");
    chatInput.value = "";
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMessage(volunteerReplies[replyIndex % volunteerReplies.length], "received", "Tusshar Singh");
        replyIndex++;
      }, 1500);
    }, 600);
  };

  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter") window.sendMessage();
  });
}

// ============================
// KICK OFF
// ============================
render();