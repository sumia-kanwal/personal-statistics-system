# Profile Questionnaire

Portfolio Project #3 is a responsive HTML, CSS, and JavaScript questionnaire for collecting participant information and reviewing descriptive statistics.

## Run the application

No build step, package installation, or external library is required. From the project folder, start a local web server:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser. The home page links to the questionnaire and administrator dashboard.

## Questionnaire and dataset

The form collects 13 required answers: name, age, gender, nationality, education level, height (cm), weight (kg), marital status, student/employee status, hobbies, daily sleeping hours, daily exercise duration (minutes), and country of residence. Inputs are validated before submission. Each accepted submission is saved as its own record with a unique ID and submission timestamp.

The initial dataset is empty. Only responses submitted through the questionnaire are included; no sample or generated participant data is provided. Records use the browser's `localStorage` under the `personalStats.records` key. Data remains in that browser and site origin, is not uploaded to a server, and is not automatically shared across browsers or devices. Clearing browser/site data removes the records. Export the CSV regularly if the data needs to be retained.

Because responses include personal information, use only with informed participants and follow applicable university research, consent, and privacy requirements. This client-side project is for coursework and is not a secure research-data platform.

## Administrator dashboard

Open **Administrator** and enter the classroom demo PIN **314159**. The PIN is a convenience gate in client-side JavaScript, not secure authentication; anyone with access to the project can inspect it. The dashboard calculates the participant count, mean age/height/weight, gender and education distributions, and charts from saved responses. It also lists records, exports them as CSV, and allows all local records to be cleared after confirmation.

CSV export contains all 13 questionnaire responses plus the record ID and timestamp. The optional C++ report can read an exported CSV:

```powershell
g++ -std=c++11 -O2 cpp\stats.cpp -o cpp\stats.exe
cpp\stats.exe profile-questionnaire-records.csv
```

## Project files

- `index.html` — project introduction and navigation
- `questionnaire.html` — participant form
- `admin.html` — administrator sign-in, dashboard, charts, records, and CSV export
- `css\styles.css` — shared responsive styling
- `js\storage.js` — localStorage records, administrator session, and CSV utilities
- `js\questionnaire.js` — form validation and submission
- `js\admin.js` — dashboard statistics, charts, and record display
- `js\charts.js` — canvas chart rendering
- `cpp\stats.cpp` — optional descriptive report for exported CSV files
