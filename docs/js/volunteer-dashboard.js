document.addEventListener("DOMContentLoaded", function () {

    // ================= PROFILE SECTION =================
    const displayName = document.getElementById("displayName");
    const displayEmail = document.getElementById("displayEmail");
    const displayPhone = document.getElementById("displayPhone");
    const displayImage = document.getElementById("displayImage");

    function loadProfile() {
        const savedProfile = JSON.parse(localStorage.getItem("userProfile"));

        if (savedProfile) {
            displayName.textContent = savedProfile.name;
            displayEmail.textContent = savedProfile.email;
            displayPhone.textContent = savedProfile.phone;
            displayImage.src = savedProfile.image || "default.png";
        }
    }

    loadProfile();


    // ================= STATS SECTION =================
    function loadStats() {
        const cases = JSON.parse(localStorage.getItem("volunteerCases")) || [];

        const total = cases.length;
        const open = cases.filter(c => c.status === "open").length;
        const active = cases.filter(c => c.status === "in-progress").length;
        const rescued = cases.filter(c => c.status === "rescued").length;

        const statTotal = document.getElementById("statTotal");
        const statOpen = document.getElementById("statOpen");
        const statActive = document.getElementById("statActive");
        const statRescued = document.getElementById("statRescued");

        if (statTotal) statTotal.textContent = total;
        if (statOpen) statOpen.textContent = open;
        if (statActive) statActive.textContent = active;
        if (statRescued) statRescued.textContent = rescued;
    }

    loadStats();


    // ================= CASE LIST SECTION =================
    function loadCases(filter) {
        filter = filter || "all";

        const cases = JSON.parse(localStorage.getItem("volunteerCases")) || [];
        const caseList = document.getElementById("caseList");
        if (!caseList) return;

        const filtered = filter === "all" ? cases : cases.filter(c => c.status === filter);

        if (filtered.length === 0) {
            caseList.innerHTML = "<p>No cases found.</p>";
            return;
        }

        caseList.innerHTML = "";

        filtered.forEach(function (c) {
            const item = document.createElement("div");
            item.className = "case-item";
            item.dataset.id = c.id;
            item.innerHTML = `
        <div class="case-info">
          <p class="case-title">${c.title}</p>
          <p class="case-location">${c.location}</p>
          <p class="case-status">${c.status}</p>
          ${c.notes ? `<p class="case-notes">${c.notes}</p>` : ""}
        </div>
        <button class="updateStatusBtn" data-id="${c.id}">Update Status</button>
      `;
            caseList.appendChild(item);
        });

        // Attach update button listeners
        document.querySelectorAll(".updateStatusBtn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openUpdateModal(btn.dataset.id);
            });
        });
    }

    loadCases("all");

    // ===== Filter Tabs =====
    const filterBtns = document.querySelectorAll(".filterBtn");

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadCases(btn.dataset.filter);
        });
    });


    // ================= UPDATE STATUS MODAL =================
    const updateModal = document.getElementById("updateModal");
    const cancelUpdate = document.getElementById("cancelUpdate");
    const saveUpdate = document.getElementById("saveUpdate");
    const statusSelect = document.getElementById("statusSelect");
    const caseNotes = document.getElementById("caseNotes");
    const modalCaseId = document.getElementById("modalCaseId");

    let editingCaseId = null;

    function openUpdateModal(id) {
        const cases = JSON.parse(localStorage.getItem("volunteerCases")) || [];
        const c = cases.find(x => x.id === id);
        if (!c) return;

        editingCaseId = id;

        if (modalCaseId) modalCaseId.textContent = "Case #" + id;
        if (statusSelect) statusSelect.value = c.status;
        if (caseNotes) caseNotes.value = c.notes || "";

        if (updateModal) updateModal.classList.add("active");
    }

    if (cancelUpdate) {
        cancelUpdate.addEventListener("click", function () {
            updateModal.classList.remove("active");
        });
    }

    if (saveUpdate) {
        saveUpdate.addEventListener("click", function () {
            const cases = JSON.parse(localStorage.getItem("volunteerCases")) || [];
            const idx = cases.findIndex(c => c.id === editingCaseId);

            if (idx !== -1) {
                cases[idx].status = statusSelect.value;
                cases[idx].notes = caseNotes.value;
                localStorage.setItem("volunteerCases", JSON.stringify(cases));
            }

            updateModal.classList.remove("active");
            loadCases(document.querySelector(".filterBtn.active")?.dataset.filter || "all");
            loadStats();
        });
    }


    // ================= LOGOUT MODAL =================
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const cancelLogout = document.getElementById("cancelLogout");
    const confirmLogout = document.getElementById("confirmLogout");

    if (logoutBtn && logoutModal && cancelLogout && confirmLogout) {

        logoutBtn.addEventListener("click", function () {
            logoutModal.classList.add("active");
        });

        cancelLogout.addEventListener("click", function () {
            logoutModal.classList.remove("active");
        });

        confirmLogout.addEventListener("click", function () {
            localStorage.removeItem("loggedIn");
            window.location.href = "login.html";
        });

    }

});


if(localStorage.getItem("role") !== "volunteer"){
  window.location.href = "login.html";
}