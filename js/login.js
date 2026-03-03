let selectedRole = "user";

const roleButtons = document.querySelectorAll(".role-btn");
const extraFields = document.getElementById("extraFields");

roleButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    roleButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedRole = btn.dataset.role;
    showFields(selectedRole);
  });
});

function showFields(role) {

  extraFields.innerHTML = "";

  if(role === "volunteer"){
    extraFields.innerHTML = `
      <input type="email" id="email" placeholder="Email" required>
      <input type="password" id="password" placeholder="Password" required>
    `;
  }

  if(role === "admin"){
    extraFields.innerHTML = `
      <input type="email" id="email" placeholder="Admin Email" required>
      <input type="password" id="password" placeholder="Password" required>
      <input type="text" id="secret" placeholder="Admin Secret Code" required>
    `;
  }
}

document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();

  console.log("Role:", selectedRole);
  console.log("Name:", document.getElementById("name").value);
  console.log("Phone:", document.getElementById("phone").value);

  // 🔥 Role-based redirect
  if (selectedRole === "user") {
    window.location.href = "user-dashboard.html";
  } 
  else if (selectedRole === "volunteer") {
    window.location.href = "volunteer-dashboard.html";
  } 
  else if (selectedRole === "admin") {
    window.location.href = "admin-dashboard.html";
  }
});