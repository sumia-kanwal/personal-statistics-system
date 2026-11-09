(function (window) {
  const LIVE_KEY = "personalStats.records";
  const AUTH_KEY = "personalStats.adminSession";
  const ADMIN_PIN = "314159";

  const COLUMNS = [
    { key: "id", label: "Record ID" },
    { key: "submittedAt", label: "Submitted at" },
    { key: "name", label: "Name" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "nationality", label: "Nationality" },
    { key: "education", label: "Education level" },
    { key: "heightCm", label: "Height (cm)" },
    { key: "weightKg", label: "Weight (kg)" },
    { key: "maritalStatus", label: "Marital status" },
    { key: "occupationalStatus", label: "Status" },
    { key: "hobbies", label: "Hobbies" },
    { key: "sleepHours", label: "Daily sleeping hours" },
    { key: "exerciseMinutes", label: "Daily exercise (minutes)" },
    { key: "country", label: "Country of residence" }
  ];

  function getRecords() {
    const raw = localStorage.getItem(LIVE_KEY);
    if (raw === null) return [];
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) {
      throw new Error("Stored questionnaire data is not a valid record list.");
    }
    return records;
  }

  function saveRecord(record) {
    const all = getRecords();
    all.push(record);
    localStorage.setItem(LIVE_KEY, JSON.stringify(all));
    return all;
  }

  function clearRecords() {
    localStorage.setItem(LIVE_KEY, "[]");
  }

  function createId() {
    return "P-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function isAdmin() {
    return sessionStorage.getItem(AUTH_KEY) === "ok";
  }

  function login(pin) {
    if (String(pin).trim() === ADMIN_PIN) {
      sessionStorage.setItem(AUTH_KEY, "ok");
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function toCsv(rows) {
    const header = COLUMNS.map(function (col) { return csvEscape(col.label); }).join(",");
    const body = rows.map(function (row) {
      return COLUMNS.map(function (col) { return csvEscape(row[col.key]); }).join(",");
    });
    return "\uFEFF" + [header].concat(body).join("\r\n");
  }

  function downloadCsv(filename, rows) {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  window.StatsStore = {
    RECORDS_KEY: LIVE_KEY,
    COLUMNS: COLUMNS,
    ADMIN_PIN_HINT: "314159",
    getRecords: getRecords,
    saveRecord: saveRecord,
    clearRecords: clearRecords,
    createId: createId,
    isAdmin: isAdmin,
    login: login,
    logout: logout,
    downloadCsv: downloadCsv
  };
})(window);
