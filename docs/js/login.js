document.addEventListener("DOMContentLoaded", function () {

  let selectedRole = "user";

  const roleButtons = document.querySelectorAll(".role-btn");
  const extraFields = document.getElementById("extraFields");
  const loginForm = document.getElementById("loginForm");

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

    if (role === "volunteer") {
      extraFields.innerHTML = `
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
      `;
    }

    if (role === "admin") {
      extraFields.innerHTML = `
        <input type="email" id="email" placeholder="Admin Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <input type="text" id="secret" placeholder="Admin Secret Code" required>
      `;
    }
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("role", selectedRole);

    if (selectedRole === "user") {
      window.location.href = "home.html";
    }

    if (selectedRole === "volunteer") {
      window.location.href = "volunteer.html";
    }

    if (selectedRole === "admin") {
      window.location.href = "admin.html";
    }
  });

});

// Backend test
fetch("http://localhost:5000/")
.then(res => res.text())
.then(data => console.log(data));