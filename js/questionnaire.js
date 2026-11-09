(function () {
  const form = document.getElementById("stats-form");
  if (!form) return;

  const modal = document.getElementById("confirm-modal");
  const countEl = document.getElementById("record-count");
  const submissionError = document.getElementById("submission-error");

  function updateCount() {
    try {
      if (countEl) countEl.textContent = String(StatsStore.getRecords().length);
    } catch (error) {
      if (submissionError) {
        submissionError.textContent = "Questionnaire storage is unavailable or contains invalid data. No response can be saved until it is fixed.";
        submissionError.classList.add("visible");
      }
      console.error("Could not read questionnaire records.", error);
    }
  }

  function setError(name, message) {
    const field = form.querySelector('[data-field="' + name + '"]');
    const error = form.querySelector('[data-error="' + name + '"]');
    if (field) field.classList.toggle("invalid", Boolean(message));
    if (error) {
      error.textContent = message || "";
      error.classList.toggle("visible", Boolean(message));
    }
  }

  function radioValue(name) {
    const checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function textValue(name) {
    const el = form.elements[name];
    return el && el.value ? el.value.trim() : "";
  }

  function numberValue(name) {
    const raw = textValue(name);
    if (raw === "") return NaN;
    return Number(raw);
  }

  function validate() {
    const checks = [];
    const name = textValue("name");
    checks.push(["name", name.length >= 2 && /^[\p{L}\s.'-]{2,80}$/u.test(name), "Enter a name using letters (2–80 characters)."]);

    const age = numberValue("age");
    checks.push(["age", Number.isInteger(age) && age >= 1 && age <= 120, "Enter age as a whole number from 1 to 120."]);

    checks.push(["gender", Boolean(radioValue("gender")), "Select a gender option."]);

    const nationality = textValue("nationality");
    checks.push(["nationality", nationality.length >= 2 && nationality.length <= 60, "Enter nationality (2–60 characters)."]);

    checks.push(["education", Boolean(textValue("education")), "Select an education level."]);

    const height = numberValue("heightCm");
    checks.push(["heightCm", Number.isFinite(height) && height >= 50 && height <= 250, "Enter height in cm between 50 and 250."]);

    const weight = numberValue("weightKg");
    checks.push(["weightKg", Number.isFinite(weight) && weight >= 20 && weight <= 400, "Enter weight in kg between 20 and 400."]);

    checks.push(["maritalStatus", Boolean(radioValue("maritalStatus")), "Select marital status."]);
    checks.push(["occupationalStatus", Boolean(radioValue("occupationalStatus")), "Select student or employee status."]);

    const hobbies = textValue("hobbies");
    checks.push(["hobbies", hobbies.length >= 1 && hobbies.length <= 300, "Enter your hobbies (1–300 characters)."]);

    const sleep = numberValue("sleepHours");
    checks.push(["sleepHours", Number.isFinite(sleep) && sleep >= 0 && sleep <= 24, "Enter daily sleeping hours from 0 to 24."]);

    const exercise = numberValue("exerciseMinutes");
    checks.push(["exerciseMinutes", Number.isInteger(exercise) && exercise >= 0 && exercise <= 600, "Enter daily exercise in whole minutes from 0 to 600."]);

    const country = textValue("country");
    checks.push(["country", country.length >= 2 && country.length <= 80, "Enter country of residence (2–80 characters)."]);

    let first = null;
    checks.forEach(function (item) {
      setError(item[0], item[1] ? "" : item[2]);
      if (!item[1] && !first) first = item[0];
    });
    if (first) {
      const field = form.querySelector('[data-field="' + first + '"]');
      if (field) field.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate()) return;

    if (submissionError) {
      submissionError.textContent = "";
      submissionError.classList.remove("visible");
    }
    try {
      const records = StatsStore.saveRecord({
        id: StatsStore.createId(),
        submittedAt: new Date().toISOString(),
        name: textValue("name"),
        age: numberValue("age"),
        gender: radioValue("gender"),
        nationality: textValue("nationality"),
        education: textValue("education"),
        heightCm: numberValue("heightCm"),
        weightKg: numberValue("weightKg"),
        maritalStatus: radioValue("maritalStatus"),
        occupationalStatus: radioValue("occupationalStatus"),
        hobbies: textValue("hobbies"),
        sleepHours: numberValue("sleepHours"),
        exerciseMinutes: numberValue("exerciseMinutes"),
        country: textValue("country")
      });
      if (countEl) countEl.textContent = String(records.length);
    } catch (error) {
      if (submissionError) {
        submissionError.textContent = "Your response could not be saved in this browser. Check that browser storage is enabled and has available space, then try again.";
        submissionError.classList.add("visible");
      }
      console.error("Could not save questionnaire response.", error);
      return;
    }

    form.reset();
    Array.prototype.forEach.call(form.querySelectorAll(".field"), function (el) {
      el.classList.remove("invalid");
    });
    Array.prototype.forEach.call(form.querySelectorAll(".error"), function (el) {
      el.classList.remove("visible");
    });
    if (modal) modal.classList.add("open");
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (modal) modal.classList.remove("open");
    });
  });

  updateCount();

  window.addEventListener("storage", function (event) {
    if (event.key === StatsStore.RECORDS_KEY || event.key === null) updateCount();
  });
})();
