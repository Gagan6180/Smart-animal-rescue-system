document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) window.location.href = "login.html";

  // ================= POPULATE DISPLAY =================
  document.getElementById("displayName").textContent = user.name || "—";
  document.getElementById("displayEmail").textContent = user.email || "—";
  document.getElementById("displayPhone").textContent = user.phone || "—";
  document.getElementById("displayRole").textContent = user.role || "citizen";

  // ================= EDIT MODE TOGGLE =================
  const profileDisplay = document.getElementById("profileDisplay");
  const profileForm = document.getElementById("profileForm");
  const editBtn = document.getElementById("editProfileBtn");

  editBtn?.addEventListener("click", () => {
    document.getElementById("inputName").value = user.name || "";
    document.getElementById("inputPhone").value = user.phone || "";
    profileDisplay.style.display = "none";
    profileForm.style.display = "block";
  });

  document.getElementById("cancelEdit")?.addEventListener("click", () => {
    profileForm.style.display = "none";
    profileDisplay.style.display = "block";
  });

  // ================= SAVE (local only — no backend profile endpoint yet) =================
  profileForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    user.name = document.getElementById("inputName").value;
    user.phone = document.getElementById("inputPhone").value;
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById("displayName").textContent = user.name;
    document.getElementById("displayPhone").textContent = user.phone;
    profileForm.style.display = "none";
    profileDisplay.style.display = "block";
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
});