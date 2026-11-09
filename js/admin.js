(function () {
  const page = document.getElementById("admin-page");
  if (!page) return;

  const loginPanel = document.getElementById("login-panel");
  const dashPanel = document.getElementById("dash-panel");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const storageError = document.getElementById("admin-storage-error");

  function mean(rows, key) {
    if (!rows.length) return "—";
    const total = rows.reduce(function (sum, row) { return sum + Number(row[key] || 0); }, 0);
    return (total / rows.length).toFixed(2);
  }

  function counts(rows, key) {
    const map = {};
    rows.forEach(function (row) {
      const label = String(row[key]);
      map[label] = (map[label] || 0) + 1;
    });
    return map;
  }

  function distributionText(map) {
    const keys = Object.keys(map);
    if (!keys.length) return "No records";
    const total = keys.reduce(function (sum, key) { return sum + map[key]; }, 0);
    return keys.map(function (key) {
      return key + " " + Math.round((map[key] / total) * 100) + "%";
    }).join(" · ");
  }

  function showDash(show) {
    loginPanel.hidden = show;
    dashPanel.hidden = !show;
  }

  function render() {
    let rows;
    try {
      rows = StatsStore.getRecords();
      storageError.textContent = "";
      storageError.classList.remove("visible");
    } catch (error) {
      storageError.textContent = "Questionnaire data could not be read from this browser. The stored data may be invalid or browser storage may be unavailable.";
      storageError.classList.add("visible");
      document.getElementById("empty-state").hidden = false;
      document.getElementById("charts-wrap").hidden = true;
      document.getElementById("table-wrap").hidden = true;
      console.error("Could not render questionnaire records.", error);
      return;
    }
    const n = rows.length;
    document.getElementById("stat-total").textContent = String(n);
    document.getElementById("stat-age").textContent = mean(rows, "age");
    document.getElementById("stat-height").textContent = n ? mean(rows, "heightCm") + " cm" : "—";
    document.getElementById("stat-weight").textContent = n ? mean(rows, "weightKg") + " kg" : "—";
    document.getElementById("stat-gender").textContent = distributionText(counts(rows, "gender"));
    document.getElementById("stat-education").textContent = distributionText(counts(rows, "education"));

    const empty = document.getElementById("empty-state");
    const charts = document.getElementById("charts-wrap");
    const tableWrap = document.getElementById("table-wrap");
    empty.hidden = n > 0;
    charts.hidden = n === 0;
    tableWrap.hidden = n === 0;

    if (n === 0) return;

    const gender = counts(rows, "gender");
    StatsCharts.drawPie(
      document.getElementById("chart-gender"),
      Object.keys(gender),
      Object.keys(gender).map(function (k) { return gender[k]; })
    );

    const education = counts(rows, "education");
    StatsCharts.drawBar(
      document.getElementById("chart-education"),
      Object.keys(education),
      Object.keys(education).map(function (k) { return education[k]; })
    );

    const status = counts(rows, "occupationalStatus");
    StatsCharts.drawPie(
      document.getElementById("chart-status"),
      Object.keys(status),
      Object.keys(status).map(function (k) { return status[k]; })
    );

    const marital = counts(rows, "maritalStatus");
    StatsCharts.drawBar(
      document.getElementById("chart-marital"),
      Object.keys(marital),
      Object.keys(marital).map(function (k) { return marital[k]; })
    );

    const tbody = document.getElementById("records-body");
    tbody.innerHTML = "";
    rows.slice().reverse().forEach(function (row) {
      const tr = document.createElement("tr");
      [
        row.id,
        row.submittedAt,
        row.name,
        row.age,
        row.gender,
        row.nationality,
        row.education,
        row.heightCm,
        row.weightKg,
        row.maritalStatus,
        row.occupationalStatus,
        row.hobbies,
        row.sleepHours,
        row.exerciseMinutes,
        row.country
      ].forEach(function (value) {
        const td = document.createElement("td");
        td.textContent = value == null ? "" : String(value);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    try {
      if (StatsStore.login(document.getElementById("admin-pin").value)) {
        loginError.classList.remove("visible");
        showDash(true);
        render();
      } else {
        loginError.textContent = "Incorrect administrator PIN.";
        loginError.classList.add("visible");
      }
    } catch (error) {
      loginError.textContent = "Administrator sign-in is unavailable because browser session storage could not be accessed.";
      loginError.classList.add("visible");
      console.error("Could not start administrator session.", error);
    }
  });

  document.getElementById("export-csv").addEventListener("click", function () {
    try {
      const rows = StatsStore.getRecords();
      if (!rows.length) {
        alert("The dataset is empty. Submit the questionnaire first, then export.");
        return;
      }
      StatsStore.downloadCsv("profile-questionnaire-records.csv", rows);
    } catch (error) {
      storageError.textContent = "The CSV could not be created. Check browser storage and try again.";
      storageError.classList.add("visible");
      console.error("Could not export questionnaire records.", error);
    }
  });

  document.getElementById("clear-records").addEventListener("click", function () {
    try {
      if (!StatsStore.getRecords().length) {
        alert("There are no records to delete.");
        return;
      }
      if (window.confirm("Delete all submitted records stored in this browser?")) {
        StatsStore.clearRecords();
        render();
      }
    } catch (error) {
      storageError.textContent = "Records could not be cleared because browser storage is unavailable.";
      storageError.classList.add("visible");
      console.error("Could not clear questionnaire records.", error);
    }
  });

  document.getElementById("logout").addEventListener("click", function () {
    StatsStore.logout();
    showDash(false);
  });

  window.addEventListener("storage", function (event) {
    if (event.key === StatsStore.RECORDS_KEY || event.key === null) render();
  });

  try {
    if (StatsStore.isAdmin()) {
      showDash(true);
      render();
    } else {
      showDash(false);
    }
  } catch (error) {
    showDash(false);
    loginError.textContent = "Administrator sign-in is unavailable because browser session storage could not be accessed.";
    loginError.classList.add("visible");
    console.error("Could not check administrator session.", error);
  }
})();
