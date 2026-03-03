const reportForm = document.getElementById("reportForm");
const reportList = document.getElementById("reportList");

let reports = [];

reportForm.addEventListener("submit", function(e){
  e.preventDefault();

  const location = document.getElementById("location").value;
  const description = document.getElementById("description").value;

  const report = {
    location,
    description
  };

  reports.push(report);

  displayReports();
  reportForm.reset();
});

function displayReports(){
  reportList.innerHTML = "";

  reports.forEach((report, index) => {
    const li = document.createElement("li");
    li.textContent = `${report.location} - ${report.description}`;
    reportList.appendChild(li);
  });
}

document.getElementById("logoutBtn").addEventListener("click", function(){
  window.location.href = "login.html";
});