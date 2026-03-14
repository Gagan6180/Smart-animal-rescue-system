document.addEventListener("DOMContentLoaded", function () {

  // ================= PROFILE SECTION =================
  const profileForm = document.getElementById("profileForm");
  const profileDisplay = document.getElementById("profileDisplay");
  const editBtn = document.getElementById("editProfileBtn");
  const profilePicInput = document.getElementById("profilePicInput");

  const displayName = document.getElementById("displayName");
  const displayEmail = document.getElementById("displayEmail");
  const displayPhone = document.getElementById("displayPhone");
  const displayAddress = document.getElementById("displayAddress");
  const displayImage = document.getElementById("displayImage");

  // ===== Load Saved Profile =====
  function loadProfile() {
    const savedProfile = JSON.parse(localStorage.getItem("userProfile"));

    if (savedProfile) {
      displayName.textContent = savedProfile.name;
      displayEmail.textContent = savedProfile.email;
      displayPhone.textContent = savedProfile.phone;
      displayAddress.textContent = savedProfile.address;
      displayImage.src = savedProfile.image || "default.png";
    }
  }

  loadProfile();

  // ===== Switch To Edit Mode =====
  if (editBtn) {
    editBtn.addEventListener("click", function () {

      const savedProfile = JSON.parse(localStorage.getItem("userProfile"));

      if (savedProfile) {
        document.getElementById("name").value = savedProfile.name;
        document.getElementById("email").value = savedProfile.email;
        document.getElementById("phone").value = savedProfile.phone;
        document.getElementById("address").value = savedProfile.address;
      }

      profileDisplay.style.display = "none";
      profileForm.style.display = "block";
    });
  }

  // ===== Save Profile =====
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const reader = new FileReader();
      const file = profilePicInput.files[0];

      if (file) {
        reader.onload = function (event) {
          saveProfile(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        saveProfile(displayImage.src);
      }
    });
  }

  function saveProfile(imageData) {
    const profileData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      image: imageData
    };

    localStorage.setItem("userProfile", JSON.stringify(profileData));

    profileForm.style.display = "none";
    profileDisplay.style.display = "block";

    loadProfile();
  }


  // ================= LOGOUT MODAL =================
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogout = document.getElementById("cancelLogout");
  const confirmLogout = document.getElementById("confirmLogout");

  if (logoutBtn && logoutModal && cancelLogout && confirmLogout) {

    logoutBtn.addEventListener("click", () => {
      logoutModal.classList.add("active");
    });

    cancelLogout.addEventListener("click", () => {
      logoutModal.classList.remove("active");
    });

    confirmLogout.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      window.location.href = "login.html";
    });

  }

});