const BASE_URL = "http://localhost:5005";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

// Redirect if not admin
if (!token || user.role !== "admin") window.location.href = "login.html";

// Show admin name
const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");
if (displayName) displayName.textContent = user.name || "Admin";
if (displayEmail) displayEmail.textContent = user.email || "";

let allCases = [];
let allVolunteers = [];

// ================= LOAD STATS =================
function updateStats() {
    const total = allCases.length;
    const open = allCases.filter(c => c.status === "open").length;
    const active = allCases.filter(c => c.status === "in-progress").length;
    const rescued = allCases.filter(c => c.status === "rescued").length;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statOpen").textContent = open;
    document.getElementById("statActive").textContent = active;
    document.getElementById("statRescued").textContent = rescued;
    document.getElementById("statVolunteers").textContent = allVolunteers.length;
}

// ================= LOAD ALL CASES =================
async function loadCases(filter = "all") {
    try {
        const res = await fetch(`${BASE_URL}/api/reports`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        allCases = await res.json();
        updateStats();
        renderCases(filter);
    } catch {
        document.getElementById("caseList").innerHTML = "<p>Could not load cases.</p>";
    }
}

function renderCases(filter = "all") {
    const caseList = document.getElementById("caseList");
    const filtered = filter === "all" ? allCases : allCases.filter(c => c.status === filter);

    if (!filtered.length) {
        caseList.innerHTML = "<p>No cases found.</p>";
        return;
    }

    caseList.innerHTML = filtered.map(c => `
    <div class="case-item">
      <div class="case-info">
        <p class="case-title">${c.animalType} — ${c.location}</p>
        <p class="case-location">Urgency: ${c.urgency}</p>
        <p class="case-status">Status: ${c.status}</p>
        ${c.assignedTo ? `<p class="case-notes">Assigned to: ${c.assignedTo.name || "Volunteer"}</p>` : "<p style='color:#e63946'>Unassigned</p>"}
      </div>
      <button class="updateStatusBtn" data-id="${c._id}">Assign / Update</button>
    </div>
  `).join("");

    document.querySelectorAll(".updateStatusBtn").forEach(btn => {
        btn.addEventListener("click", () => openAssignModal(btn.dataset.id));
    });
}

// ================= FILTER TABS =================
document.querySelectorAll(".filterBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderCases(btn.dataset.filter);
    });
});

// ================= LOAD VOLUNTEERS =================
async function loadVolunteers() {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/volunteers`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        allVolunteers = await res.json();
        renderVolunteers();
    } catch {
        document.getElementById("volunteerList").innerHTML = "<p>Could not load volunteers.</p>";
    }
}

function renderVolunteers() {
    const list = document.getElementById("volunteerList");
    if (!allVolunteers.length) {
        list.innerHTML = "<p>No volunteers registered yet.</p>";
        return;
    }
    list.innerHTML = allVolunteers.map(v => `
    <div class="case-item">
      <div class="case-info">
        <p class="case-title">${v.name}</p>
        <p class="case-location">${v.email} · ${v.phone || "No phone"}</p>
      </div>
    </div>
  `).join("");
}

// ================= ASSIGN MODAL =================
let editingCaseId = null;

function openAssignModal(id) {
    editingCaseId = id;
    const c = allCases.find(x => x._id === id);
    if (!c) return;

    document.getElementById("modalCaseId").textContent = `${c.animalType} — ${c.location}`;
    document.getElementById("statusSelect").value = c.status;
    document.getElementById("caseNotes").value = c.description || "";

    const volunteerSelect = document.getElementById("volunteerSelect");
    volunteerSelect.innerHTML = `<option value="">-- No Assignment --</option>` +
        allVolunteers.map(v => `<option value="${v._id}" ${c.assignedTo?._id === v._id ? "selected" : ""}>${v.name}</option>`).join("");

    document.getElementById("assignModal").classList.add("active");
}

document.getElementById("cancelAssign")?.addEventListener("click", () => {
    document.getElementById("assignModal").classList.remove("active");
});

document.getElementById("saveAssign")?.addEventListener("click", async () => {
    const status = document.getElementById("statusSelect").value;
    const assignedTo = document.getElementById("volunteerSelect").value;

    try {
        await fetch(`${BASE_URL}/api/reports/${editingCaseId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status, ...(assignedTo && { assignedTo }) })
        });
        document.getElementById("assignModal").classList.remove("active");
        loadCases(document.querySelector(".filterBtn.active")?.dataset.filter || "all");
    } catch {
        alert("Failed to update case.");
    }
});

// ================= LOGOUT =================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    document.getElementById("logoutModal").classList.add("active");
});
document.getElementById("cancelLogout")?.addEventListener("click", () => {
    document.getElementById("logoutModal").classList.remove("active");
});
document.getElementById("confirmLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

// ================= INIT =================
loadCases();
loadVolunteers();