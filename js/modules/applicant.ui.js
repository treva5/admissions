(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const THEME = "noemion.epic2.theme.v1";
  const defaults = {
    Primary: { programmes: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "Primary 7"], modes: ["Day", "Boarding"], docs: ["Birth certificate or age evidence", "Parent / guardian identification", "Immunisation record", "Previous school report (if applicable)"], instructions: "Primary intake includes learner biodata, guardian details, previous school records and one of the available study arrangements." },
    Secondary: { programmes: ["Senior 1", "Senior 2", "Senior 3", "Senior 4", "Senior 5", "Senior 6"], modes: ["Day", "Boarding"], docs: ["Birth or identity record", "Parent / guardian identification", "PLE or previous school results", "Transfer report if applicable"], instructions: "Secondary intake includes previous school records, class selection and the selected study arrangement. Senior 1 applicants enter PLE subject grades." },
    Vocational: { programmes: ["Certificate in ICT", "Certificate in Secretaryship", "Stenography and Computer Applications", "Accountancy and Auditing", "Marketing and Salesmanship", "Banking Operations", "Electrical Technology", "Automobile Technology", "Structure and Fabrication Technology", "Air Conditioning and Refrigeration Technology", "Electronics Technology", "Dairying", "Fashion and Design", "Agriculture", "Hospitality"], modes: ["Day", "Night", "Weekend", "Online"], docs: ["National ID or age evidence", "Previous academic certificates", "Programme prerequisites", "Guardian or emergency contact"], instructions: "Choose a course and Day, Night, Weekend or Online study arrangement. Complete an entry practice assessment before biodata." },
    Tertiary: { programmes: ["Diploma in Secretaryship", "Diploma in Stenography and Computer Applications", "Diploma in Accountancy and Auditing", "Diploma in Marketing and Salesmanship", "Diploma in Banking", "Diploma in Electrical Technology", "Diploma in Automobile Technology", "Diploma in Structure and Fabrication Technology", "Diploma in Air Conditioning and Refrigeration Technology", "Diploma in Electronics Technology", "Diploma in Dairying", "Diploma in ICT", "Certificate in Business Studies", "Certificate in ICT"], modes: ["Day", "Night", "Weekend", "Online"], docs: ["National ID", "Academic certificates and transcripts", "Programme prerequisites", "Emergency contact"], instructions: "Choose a programme and Day, Night, Weekend or Online study arrangement. Complete an entry practice assessment before biodata." }
  };
  const courseDetails = {
    "Diploma in Secretaryship": "Office Practice and Secretaryship (604) · Secretariat Practice and Accounting (605) · Office Communication (606)",
    "Diploma in Stenography and Computer Applications": "Typewriting (English) (607) · Stenography (English) (608) · Typewriting (Hindi) (609) · Stenography (Hindi) (610)",
    "Diploma in Accountancy and Auditing": "Financial Accounting (611) · Elements of Cost Accountancy and Auditing (612) · Optional: Store Accounting or Typewriting",
    "Diploma in Marketing and Salesmanship": "Marketing (613) · Salesmanship (614) · Consumer Behaviour and Protection (615)",
    "Diploma in Banking": "Cash Management and House Keeping (619) · Lending Operations (620) · Management of Bank Office (621)",
    "Diploma in Electrical Technology": "Engineering Science (622) · Electrical Machines (623) · Electrical Appliances (624) · Optional: Applied Physics or Mechanical Engineering",
    "Diploma in Automobile Technology": "Auto Engineering (627) · Auto Shop Repair and Practice (628) · Optional: Applied Physics or Civil Engineering",
    "Diploma in Structure and Fabrication Technology": "Fabrication Technology II (630) · Fabrication Technology III (631) · Optional: Applied Physics or Civil Engineering",
    "Diploma in Air Conditioning and Refrigeration Technology": "Air Conditioning and Refrigeration III (632) · Air Conditioning and Refrigeration IV (633) · Optional: Applied Physics or Civil Engineering",
    "Diploma in Electronics Technology": "Electronic Devices and Circuits (634) · Radio Engineering and Audio Systems (635) · Television and Video Systems (636) · Optional: Electrical Engineering (637) or Civil Engineering (638)",
    "Diploma in Dairying": "Milk and Milk Products (639) · Milk Production, Transport and Co-operation"
  };
  const gradePoints = { "A+": 6, A: 6, B: 5, C: 4, D: 3, E: 2, O: 1, F: 0 };
  const pleCoreSubjects = ["English", "Mathematics", "Integrated Science", "Social Studies"];
  const advancedSubjects = ["Agriculture", "Biology", "Chemistry", "Computer Studies", "CRE", "Economics", "Entrepreneurship", "Fine Art", "Food and Nutrition", "Geography", "History", "Islamic Religious Education (IRE)", "Literature in English", "English Language", "Mathematics", "Applied Mathematics", "Physics", "Technical Drawing", "French", "Kiswahili", "Luganda", "Music", "Physical Education"];
  let step = 0;
  let assessmentComplete = false;
  let messageTimer;
  function escape(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
  function config(level) { try { return JSON.parse(localStorage.getItem("noemion.epic2.pathway-settings.v1") || "{}")[level] || {}; } catch { return {}; } }
  function toast(text) { const node = $("#toast"); node.textContent = text; clearTimeout(messageTimer); messageTimer = setTimeout(() => node.textContent = "", 3000); }
  function open(dialog) { if (!dialog.open) dialog.showModal(); }
  function close(dialog) { if (dialog.open) dialog.close(); }
  function levelChanged(level) {
    const baseline = defaults[level];
    if (!baseline) { $("#external-results").hidden = true; $("#app-programme").innerHTML = '<option value="">Select pathway first</option>'; $("#study-mode").innerHTML = '<option value="">Select pathway first</option>'; $("#level-guidance").textContent = "Choose a pathway to see entry details and supporting documents."; $("#document-guidance").textContent = "Choose a pathway first."; return; }
    const saved = config(level);
    const programmes = saved.programmes?.length ? saved.programmes : baseline.programmes;
    const services = saved.services || {};
    const modeKeys = { Day: "day", Boarding: "boarding", Night: "night", Weekend: "weekend", Online: "online" };
    const modes = baseline.modes.filter(mode => {
      const key = modeKeys[mode];
      if (typeof services[key] === "boolean") return services[key];
      if (key === "night" && typeof services.evening === "boolean") return services.evening;
      if (key === "online" && typeof services.onlineClass === "boolean") return services.onlineClass;
      return true;
    });
    $("#selected-level-label").textContent = level;
    $("#programme-label").textContent = ["Primary", "Secondary"].includes(level) ? "Class" : "Course";
    $("#external-results").hidden = !["Vocational", "Tertiary"].includes(level);
    $("[name=previousClass]").placeholder = level === "Primary" ? "e.g. Primary 6" : level === "Secondary" ? "e.g. Senior 3" : "Enter class only";
    $("#form-heading").textContent = `${level} application`;
    $("#app-programme").innerHTML = '<option value="">Choose a class</option>' + programmes.map(item => `<option>${escape(item)}</option>`).join("");
    if (!["Primary", "Secondary"].includes(level)) $("#app-programme").innerHTML = '<option value="">Choose a course</option>' + programmes.map(item => `<option>${escape(item)}</option>`).join("");
    updateCombination(); updateProgrammeExtras();
    $("#study-mode").innerHTML = '<option value="">Choose a study arrangement</option>' + modes.map(item => `<option>${escape(item)}</option>`).join("");
    updateCourseDetails();
    $("#level-guidance").innerHTML = `<b>${escape(level)}:</b> ${escape(services?.instructions || baseline.instructions)}`;
    $("#document-guidance").textContent = saved.documents?.length ? saved.documents.join(" · ") : baseline.docs.join(" · ");
    renderLevelFees(level);
    const rules = { Primary: "<p>Primary learners are expected to attend regularly, follow staff guidance, respect others, care for learning materials and wear the approved uniform.</p><p>Families should keep contact details current and inform the school about health or care needs through the school office. Study arrangement is selected separately.</p>", Secondary: "<p>Secondary learners are expected to attend lessons and assessments, uphold academic integrity, follow uniform and conduct expectations, and respect fellow learners and school property.</p><p>Families should keep contact details current and confirm current fees and reporting dates with the school. Select the study arrangement offered for the chosen class.</p>", Vocational: "<p>Vocational learners must follow course attendance, assessment integrity, workshop and equipment safety instructions, and any protective clothing requirements for their course.</p><p>Day, Night, Weekend and Online arrangements depend on the selected course. Confirm current fees, entry requirements and reporting dates with admissions.</p>", Tertiary: "<p>Tertiary learners must follow programme attendance, academic integrity, assessment, laboratory or workshop safety, and student conduct requirements.</p><p>Day, Night, Weekend and Online arrangements depend on the programme. Confirm current fees, prerequisites and reporting dates with admissions.</p>" };
    $("#school-rules-text").innerHTML = rules[level];
    const addAssessment = ["Vocational", "Tertiary"].includes(level) && services.assessment !== false;
    $("#assessment-result-field").classList.toggle("visible", addAssessment);
    assessmentComplete = false;
    $("#application-form").elements.entryAssessment.value = "";
    const known = ["Learner full name", "Date of birth", "Parent / guardian contact", "Previous school & academic history", "Emergency contact", "Day or accommodation preference"];
    const custom = (saved.fields || []).filter(field => field.enabled && !known.includes(field.title));
    $("#custom-applicant-fields").innerHTML = custom.map((field, index) => `<label>${escape(field.title)}<input name="customField${index}" placeholder="${escape(field.detail || "Enter details")}"></label>`).join("");
  }
  function renderLevelFees(level) {
    const fees = config(level).fees || []; const entries = fees.filter(item => item.title).map(item => {
      const amount = Number(String(item.amount || "").replace(/,/g, ""));
      return { title: item.title, amount: Number.isFinite(amount) && amount > 0 ? "UGX " + amount.toLocaleString("en-UG") : "Not published", date: item.date || "" };
    });
    const required = ["Application fee", "Admission fee", "Tuition / term fees"];
    const missing = required.filter(title => !fees.some(item => item.title && new RegExp(title.split(/[ /]/)[0], "i").test(item.title) && Number(String(item.amount || "").replace(/,/g, "")) > 0));
    $("#level-fees").innerHTML = "<h3>" + escape(level) + " fees</h3>" + (entries.length ? entries.map(item => "<div class=\"level-fee-row\"><b>" + escape(item.title) + "</b><strong>" + escape(item.amount) + "</strong><small>" + escape(item.date) + "</small></div>").join("") : "<p>No fees have been published for this level yet.</p>") + (missing.length ? "<small>Confirm " + escape(missing.join(", ")) + " with admissions before paying.</small>" : "");
  }
  function updateCourseDetails() {
    const name = $("#app-programme").value; const aliases = { "Stenography and Computer Applications": "Diploma in Stenography and Computer Applications", "Accountancy and Auditing": "Diploma in Accountancy and Auditing", "Marketing and Salesmanship": "Diploma in Marketing and Salesmanship", "Banking Operations": "Diploma in Banking", "Electrical Technology": "Diploma in Electrical Technology", "Automobile Technology": "Diploma in Automobile Technology", "Structure and Fabrication Technology": "Diploma in Structure and Fabrication Technology", "Air Conditioning and Refrigeration Technology": "Diploma in Air Conditioning and Refrigeration Technology", "Electronics Technology": "Diploma in Electronics Technology", "Dairying": "Diploma in Dairying" }; const key = aliases[name] || (/^(Diploma|Certificate) in /.test(name) ? name.replace(/^(Diploma|Certificate) in /, "Diploma in ") : name);
    const detail = courseDetails[key]; const level = $("#app-level").value; const baseline = defaults[level]; if (!baseline) return;
    const saved = config(level); const services = saved.services;
    const instruction = services?.instructions || baseline.instructions;
    $("#level-guidance").innerHTML = "<b>" + escape(level) + ":</b> " + escape(instruction) + (detail ? "<br><b>Course subjects:</b> " + escape(detail) : "");
  }
  function gradeOptions(values) { return "<option value=\"\">Choose grade</option>" + values.map(value => "<option value=\"" + value + "\">" + value + (gradePoints[value] !== undefined ? " · " + gradePoints[value] + " points" : "") + "</option>").join(""); }
  function renderSecondaryGrades() {
    const container = $("#secondary-grade-entries"); const grades = new Map([...container.querySelectorAll("select[data-subject]")].map(select => [select.dataset.subject, select.value]));
    const selected = [...document.querySelectorAll("#subject-options input:checked")].map(input => input.value); if (!$("#secondary-combination").hidden) selected.push("General Paper");
    const options = Object.keys(gradePoints); container.innerHTML = selected.map(subject => "<label class=\"grade-entry\"><span>" + escape(subject) + (subject === "General Paper" ? " (compulsory)" : "") + "</span><select data-subject=\"" + escape(subject) + "\">" + gradeOptions(options) + "</select></label>").join("");
    for (const select of container.querySelectorAll("select[data-subject]")) select.value = grades.get(select.dataset.subject) || "";
    calculateSecondaryPoints();
  }
  function calculateSecondaryPoints() {
    const selects = [...$("#secondary-grade-entries").querySelectorAll("select[data-subject]")]; const score = selects.reduce((sum, select) => sum + (gradePoints[select.value] ?? 0), 0);
    $("#secondary-total").textContent = selects.length ? (selects.some(select => !select.value) ? "Enter a grade for each subject and General Paper. A+ = 6, A = 6, B = 5, C = 4, D = 3, E = 2, O = 1 (illustrative)." : "Indicative combined points: " + score + " · Confirm the official scale with admissions.") : "";
  }
  function addResultRow(type) {
    const root = $("#" + type + "-results-rows"); const row = document.createElement("div"); row.className = "result-row";
    const subject = document.createElement("input"); subject.type = "text"; subject.placeholder = "Subject"; subject.setAttribute("aria-label", type.toUpperCase() + " subject");
    const grade = document.createElement("select"); grade.setAttribute("aria-label", type.toUpperCase() + " grade");
    const choices = type === "uce" ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "F9"] : Object.keys(gradePoints);
    grade.innerHTML = gradeOptions(choices); grade.addEventListener("change", calculateExternalResults); subject.addEventListener("input", calculateExternalResults);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "button remove-mark-row"; remove.textContent = "Remove"; remove.setAttribute("aria-label", "Remove " + type.toUpperCase() + " result row"); remove.addEventListener("click", () => { row.remove(); calculateExternalResults(); });
    row.append(subject, grade, remove); root.append(row); calculateExternalResults();
  }
  function readResultRows(type) {
    return [...$("#" + type + "-results-rows").querySelectorAll(".result-row")].map(row => ({ subject: row.querySelector("input").value.trim(), grade: row.querySelector("select").value })).filter(row => row.subject || row.grade);
  }
  function calculateExternalResults() {
    const uce = readResultRows("uce"); const uace = readResultRows("uace");
    const uceTotal = uce.reduce((sum, row) => sum + (row.grade ? (row.grade === "F9" ? 9 : Number(row.grade)) : 0), 0);
    const uaceTotal = uace.reduce((sum, row) => sum + (gradePoints[row.grade] ?? 0), 0);
    $("#uce-total").textContent = uce.some(row => row.grade) ? "UCE aggregate estimate: " + uceTotal + " (entered grade sum; lower is stronger)" : "Enter UCE grades to calculate an aggregate estimate.";
    $("#uace-total").textContent = uace.some(row => row.grade) ? "UACE indicative points: " + uaceTotal + " · A+ = 6, A = 6, B = 5, C = 4, D = 3, E = 2, O = 1" : "Enter UACE grades to calculate indicative points.";
  }
  function collectExternalResults() { const uce = readResultRows("uce"); const uace = readResultRows("uace"); return { uce, uace, uceAggregate: uce.some(row => row.grade) ? uce.reduce((sum, row) => sum + (row.grade ? (row.grade === "F9" ? 9 : Number(row.grade)) : 0), 0) : "", uacePoints: uace.some(row => row.grade) ? uace.reduce((sum, row) => sum + (gradePoints[row.grade] ?? 0), 0) : "" }; }
  function stepFields() { return [...document.querySelectorAll(`.form-step[data-step="${step}"] input[required],.form-step[data-step="${step}"] select[required],.form-step[data-step="${step}"] textarea[required]`)]; }
  function buildPleCoreResults() {
    const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    $("#ple-core-results").innerHTML = pleCoreSubjects.map(subject => "<label class=\"result-row\"><b>" + subject + "</b><select data-ple-subject=\"" + subject + "\" aria-label=\"PLE " + subject + " grade\">" + gradeOptions(grades) + "</select></label>").join("");
  }
  function updateProgrammeExtras() {
    const level = $("#app-level").value; const value = $("#app-programme").value;
    const isSeniorOne = level === "Secondary" && /^(senior\s*1|s1|form\s*1)$/i.test(value.trim());
    $("#ple-results").hidden = !isSeniorOne;
    if (!isSeniorOne) { $("#ple-core-results").querySelectorAll("select").forEach(select => select.value = ""); $("#ple-extra-results").innerHTML = ""; }
    calculatePle();
  }
  function calculatePle() {
    const root = $("#ple-results");
    const core = [...$("#ple-core-results").querySelectorAll("select[data-ple-subject]")];
    const extras = [...$("#ple-extra-results").querySelectorAll(".ple-extra-row")];
    const grades = core.map(select => select.value).concat(extras.map(row => row.querySelector("select").value).filter(Boolean));
    const total = grades.reduce((sum, grade) => sum + (Number(grade) || 0), 0);
    $("#ple-total").textContent = root.hidden ? "" : grades.length ? "Entered PLE grade total: " + total + " (indicative; lower aggregate is stronger)" : "Enter PLE grades to calculate the aggregate.";
    return core.every(select => select.value) ? total : "";
  }
  function addPleExtra() {
    const row = document.createElement("div"); row.className = "result-row ple-extra-row";
    const subject = document.createElement("input"); subject.placeholder = "Additional PLE subject"; subject.setAttribute("aria-label", "Additional PLE subject");
    const grade = document.createElement("select"); grade.setAttribute("aria-label", "Additional PLE grade"); grade.innerHTML = gradeOptions(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "button remove-mark-row"; remove.textContent = "Remove"; remove.addEventListener("click", () => { row.remove(); calculatePle(); });
    row.append(subject, grade, remove); $("#ple-extra-results").append(row);
  }
  function readPleResults() {
    const core = [...$("#ple-core-results").querySelectorAll("select[data-ple-subject]")].map(select => ({subject: select.dataset.pleSubject, grade: select.value}));
    const extra = [...$("#ple-extra-results").querySelectorAll(".ple-extra-row")].map(row => ({subject: row.querySelector("input").value.trim(), grade: row.querySelector("select").value})).filter(item => item.subject || item.grade);
    return core.concat(extra).filter(item => item.grade);
  }
  function selectedFiles(selector = ".document-file-input") { return [...document.querySelectorAll(selector)].flatMap(input => [...input.files]); }
  function addDocumentPicker() {
    const label = document.createElement("label"); label.className = "upload-control extra-document-picker"; label.append(document.createTextNode("＋ Select more supporting documents"));
    const input = document.createElement("input"); input.type = "file"; input.name = "documents"; input.className = "document-file-input"; input.accept = ".pdf,.jpg,.jpeg,.png"; input.multiple = true; input.setAttribute("aria-label", "Select more supporting documents");
    label.append(input); $("#document-pickers").append(label);
  }
  function updateCombination() {
    const level = $("#app-level").value; const choice = $("#app-programme").value;
    const visible = level === "Secondary" && /^(senior\s*[56]|s[56]|form\s*[56])$/i.test(choice.trim());
    const box = $("#secondary-combination"); box.hidden = !visible;
    if (!visible) box.querySelectorAll("input[type=checkbox]").forEach(input => input.checked = false);
    const count = box.querySelectorAll("input[type=checkbox]:checked").length;
    $("#combination-count").textContent = visible ? (count === 3 ? "3 subjects selected" : "Choose 3 subjects · " + count + " selected") : "Choose 3 subjects";
  }
  function buildSubjectChoices() {
    $("#subject-options").innerHTML = advancedSubjects.map(subject => "<label><input type=\"checkbox\" name=\"subjectChoice\" value=\"" + escape(subject) + "\"> " + escape(subject) + "</label>").join("");
    $("#subject-options").addEventListener("change", event => { const selected = [...$("#subject-options").querySelectorAll("input:checked")]; if (selected.length > 3) event.target.checked = false; updateCombination(); renderSecondaryGrades(); calculateSecondaryPoints(); });
    $("#secondary-grade-entries").addEventListener("change", calculateSecondaryPoints);
  }
  function validStep() {
    const status = step === 0 ? $("#pathway-message") : $("#application-message");
    if (status) status.textContent = "";
    for (const field of stepFields()) {
      if (field.type === "checkbox" ? !field.checked : !field.value.trim()) {
        if (status) status.textContent = "Please complete the required fields before continuing.";
        field.reportValidity(); field.focus(); return false;
      }
    }
    if (step === 0 && !$("#ple-results").hidden) {
      const missing = [...$("#ple-core-results").querySelectorAll("select")].find(select => !select.value);
      if (missing) { $("#ple-total").textContent = "Enter the PLE grade for each core subject."; $("#pathway-message").textContent = "Please enter a grade for English, Mathematics, Integrated Science and Social Studies."; missing.focus(); return false; }
      const incompleteExtra = [...document.querySelectorAll("#ple-extra-results .ple-extra-row")].find(row => (row.querySelector("input").value || row.querySelector("select").value) && (!row.querySelector("input").value || !row.querySelector("select").value));
      if (incompleteExtra) { $("#pathway-message").textContent = "Complete or remove the additional PLE subject row."; incompleteExtra.querySelector("input").focus(); return false; }
    }
    if (step === 0 && !$("#secondary-combination").hidden) {
      if ($("#subject-options input:checked").length !== 3) { $("#combination-count").textContent = "Please select exactly 3 principal subjects."; $("#pathway-message").textContent = "Select three principal subjects before continuing."; $("#subject-options input").focus(); return false; }
      const missingGrade = [...document.querySelectorAll("#secondary-grade-entries select")].find(select => !select.value);
      if (missingGrade) { $("#secondary-total").textContent = "Enter a grade for each selected subject and General Paper."; $("#pathway-message").textContent = "Enter grades for all selected subjects and General Paper."; missingGrade.focus(); return false; }
    }
    return true;
  }
  function renderStep() {
    document.querySelectorAll(".form-step").forEach((element, index) => element.classList.toggle("active", index === step));
    document.querySelectorAll("#step-track span").forEach((element, index) => element.classList.toggle("current", index <= step));
    $("#step-description").textContent = ["Step 1 of 4 · Confirm level and choose a class or course.", "Step 2 of 4 · Learner biodata.", "Step 3 of 4 · Guardian and academic history.", "Step 4 of 4 · Documents and review."][step];
    $("#previous-step").disabled = step === 0;
    $("#next-step").hidden = step === 3;
    $("#submit-application").hidden = step !== 3;
    if (step === 3) renderReview();
  }
  function start(level) { $("#application-form").reset(); $("#ple-extra-results").innerHTML = ""; $("#ple-core-results").querySelectorAll("select").forEach(select => select.value = ""); document.querySelectorAll(".extra-document-picker").forEach(label => label.remove()); $("#uce-results-rows").innerHTML = ""; $("#uace-results-rows").innerHTML = ""; $("#secondary-grade-entries").innerHTML = ""; step = 0; assessmentComplete = false; levelChanged(""); if (level) { $("#app-level").value = level; levelChanged(level); if (["Vocational", "Tertiary"].includes(level)) { addResultRow("uce"); addResultRow("uace"); } } $("#application-message").textContent = ""; renderStep(); open($("#application-dialog")); }
  function formDataObject() { const object = Object.fromEntries([...new FormData($("#application-form")).entries()].filter(([key, value]) => key !== "documents" && key !== "subjectChoice" && !(value instanceof File))); object.subjectCombination = [...document.querySelectorAll("#subject-options input:checked")].map(input => input.value); object.secondaryGrades = [...$("#secondary-grade-entries").querySelectorAll("select")].map(select => ({ subject: select.dataset.subject, grade: select.value, points: gradePoints[select.value] ?? 0 })); object.externalResults = ["Vocational", "Tertiary"].includes(object.level) ? collectExternalResults() : null; object.generalPaper = object.level === "Secondary" && /^(senior\s*[56]|s[56]|form\s*[56])$/i.test((object.programme || "").trim()); object.entryAssessment = assessmentComplete ? $("#application-form").elements.entryAssessment.value : "Not required"; object.pleResults = readPleResults(); object.pleAggregate = calculatePle(); object.documents = selectedFiles().map(file => file.name); object.medicalReports = selectedFiles(".medical-file-input").map(file => file.name); return object; }
  function renderReview() {
    const app = formDataObject();
    const fields = [["Pathway", app.level], ["Class / course", app.programme], ["Study arrangement", app.studyMode], ["Learner", [app.firstName, app.otherNames, app.lastName].filter(Boolean).join(" ")], ["Date of birth", app.dateOfBirth], ["Gender / nationality", `${app.gender} · ${app.nationality}`], ["Home address", app.homeAddress], ["Father", app.fatherName], ["Father contact", app.fatherPhone], ["Mother", app.motherName], ["Mother contact", app.motherPhone], ["Additional guardian", app.guardianName || "Optional / not provided"], ["Emergency contact", app.emergencyContact], ["Previous school", app.previousSchool], ["Last class attended", app.previousClass], ["Entry practice assessment", app.entryAssessment], ["Selected document names", app.documents.join(", ") || "None selected"], ["Medical reports selected", app.medicalReports.length ? app.medicalReports.length + " file(s)" : "None"]];
    if (!$("#secondary-combination").hidden) { fields.push(["Senior combination", app.subjectCombination.join(", ")]); fields.push(["Subject grades", app.secondaryGrades.map(item => item.subject + " " + item.grade).join(", ")]); fields.push(["Indicative combined points", app.secondaryGrades.reduce((sum, item) => sum + item.points, 0)]); }
    if (app.pleResults?.length) { fields.push(["PLE results", app.pleResults.map(item => item.subject + " " + item.grade).join(", ")]); fields.push(["PLE aggregate estimate", app.pleAggregate]); }
    if (app.externalResults) { fields.push(["UCE results", app.externalResults.uce.map(item => item.subject + " " + item.grade).join(", ")]); fields.push(["UCE aggregate estimate", app.externalResults.uceAggregate]); fields.push(["UACE results", app.externalResults.uace.map(item => item.subject + " " + item.grade).join(", ")]); fields.push(["UACE indicative points", app.externalResults.uacePoints]); }
    $("#application-review").innerHTML = fields.map(([label, value]) => `<div class="review-item"><small>${escape(label)}</small><b>${escape(value || "Not provided")}</b></div>`).join("");
    $("#file-names").textContent = app.documents.length ? app.documents.join(" · ") : "You can add as many documents as needed.";
    const medicalFiles = selectedFiles(".medical-file-input"); $("#medical-file-names").textContent = medicalFiles.length ? medicalFiles.map(file => file.name).join(" · ") : "No medical files selected.";
  }
  async function submit(event) {
    event.preventDefault(); if (!validStep()) return;
    const applicant = formDataObject(); const button = $("#submit-application"); button.disabled = true; button.textContent = "Submitting…";
    $("#application-message").textContent = "Sending your application securely…";
    try {
      const result = await window.NoemionApi.submitApplication(applicant, selectedFiles(), selectedFiles(".medical-file-input"));
      const reference = result.reference || result.applicationNumber || result.id;
      if (!reference) throw new Error("The service did not return an application reference. Please contact the school.");
      $("#status-reference").value = String(reference);
      close($("#application-dialog")); $("#success-reference").textContent = "Application reference: " + reference; open($("#success-dialog"));
    } catch (error) { $("#application-message").textContent = error.message; }
    finally { button.disabled = false; button.textContent = "Submit application"; }
  }
  async function lookupApplication(event) {
    event.preventDefault(); const reference = $("#status-reference").value.trim(); const phone = $("#status-phone").value.trim();
    const button = $("#status-lookup-button"); const message = $("#status-lookup-message"); const letter = $("#admission-letter-link");
    if (!reference || !phone) { message.textContent = "Enter the application reference and parent or guardian phone number."; return; }
    button.disabled = true; button.textContent = "Checking…"; message.textContent = "Checking with admissions…"; letter.hidden = true; letter.removeAttribute("href");
    try {
      const result = await window.NoemionApi.lookupApplication(reference, phone);
      const status = result.status || result.applicationStatus || "Under review";
      const approved = /offer issued|approved|admitted/i.test(status);
      message.textContent = result.message || (approved ? "Your application is approved." : "Application status: " + status + ". An admission letter will be available here after approval.");
      const target = result.admissionLetterUrl || result.letterUrl;
      if (approved && target) {
        const url = new URL(target, document.baseURI);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("The admission letter link is invalid.");
        letter.href = url.href; letter.textContent = "Download admission letter" + (result.admissionNumber ? " · " + result.admissionNumber : ""); letter.hidden = false;
      } else if (approved) message.textContent += " The offer is approved, but the downloadable letter is not yet available; contact admissions.";
    } catch (error) { message.textContent = error.message || "Could not check the application. Please try again."; }
    finally { button.disabled = false; button.textContent = "Check status"; }
  }
  function addAssistantMessage(text, kind) { const item = document.createElement("p"); item.className = kind === "question" ? "assistant-question-bubble" : "assistant-reply"; item.textContent = text; $("#assistant-messages").append(item); $("#assistant-messages").scrollTop = $("#assistant-messages").scrollHeight; }
  function quickAnswer(question, level) {
    const q = question.toLowerCase();
    if (/class|grade|year level/.test(q)) return level === "Primary" ? "Primary applicants select one class from Primary 1 to Primary 7." : level === "Secondary" ? "Secondary applicants select one class from Senior 1 to Senior 6." : "Choose one course or programme from the options shown for your selected level.";
    if (/document|upload|record|certificate/.test(q)) return "The Documents step lists records requested for your chosen level. Upload readable PDF or image files; admissions staff will confirm if anything else is needed.";
    if (/fee|cost|pay|admission fee/.test(q)) return "Fees can vary by level, course and study arrangement. Check the fee information shown in the application and confirm current amounts with the admissions office.";
    if (/hostel|boarding|dorm|accommodation|study arrangement/.test(q)) return ["Primary", "Secondary"].includes(level) ? "Primary and Secondary applicants can choose Day or Boarding." : "Vocational and Tertiary applicants can choose Day, Night, Weekend or Online.";
    if (/apply|application|submit|admission/.test(q)) return "Choose a level card, complete the learner and parent details, attach any requested records, then read and accept that level’s rules before submitting. An offer is issued only after staff review.";
    return "I can help with application steps, class or course choices, documents, fees and accommodation. For a school-specific decision, please contact admissions.";
  }
  async function askAssistant(event) {
    event.preventDefault(); const input = $("#assistant-question"); const question = input.value.trim(); if (!question) return;
    addAssistantMessage(question, "question"); input.value = ""; const level = $("#app-level").value || ""; const status = $("#assistant-status"); status.textContent = "Thinking…";
    try { const result = await window.NoemionApi.askAdmissionsAssistant(question, level); if (!result.answer) throw new Error("No answer received"); addAssistantMessage(result.answer, "answer"); status.textContent = "AI assistant · verify official details with admissions."; }
    catch { addAssistantMessage(quickAnswer(question, level), "answer"); status.textContent = "Quick guidance shown · live AI connection is not configured yet."; }
  }
  function populateNationalities() { const codes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW".split(" "); const names = new Intl.DisplayNames(["en"], {type:"region"}); const select = $("#nationality"); for (const code of codes) { const name = names.of(code); if (name && name !== code) select.add(new Option(name, name)); } select.value = "Uganda"; }
  function downloadRules() { const body = $("#school-rules-text").innerHTML; const html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Noemion School Rules</title></head><body><h1>Noemion School · Applicant Rules</h1>" + body + "</body></html>"; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([html], {type:"text/html;charset=utf-8"})); link.download = "noemion-school-rules.html"; link.click(); URL.revokeObjectURL(link.href); }
  function init() {
    const theme = localStorage.getItem(THEME) || "system"; document.documentElement.dataset.theme = theme; $("#applicant-theme").value = theme;
    $("#applicant-theme").addEventListener("change", event => { document.documentElement.dataset.theme = event.target.value; localStorage.setItem(THEME, event.target.value); });
    document.querySelectorAll("[data-apply-level]").forEach(button => button.addEventListener("click", () => start(button.dataset.applyLevel)));
    $("#next-step").addEventListener("click", () => {
      if (!validStep()) return;
      const level = $("#app-level").value;
      if (step === 0 && ["Vocational", "Tertiary"].includes(level) && !assessmentComplete) { open($("#assessment-dialog")); return; }
      step = Math.min(3, step + 1); renderStep();
    });
    $("#app-programme").addEventListener("change", () => { updateCombination(); updateProgrammeExtras(); renderSecondaryGrades(); updateCourseDetails(); });
    $("#add-ple-subject").addEventListener("click", addPleExtra);
    $("#ple-core-results").addEventListener("change", calculatePle);
    $("#ple-extra-results").addEventListener("input", calculatePle);
    $("#ple-extra-results").addEventListener("change", calculatePle);
    $("#add-document-picker").addEventListener("click", addDocumentPicker);
    $("#document-pickers").addEventListener("change", renderReview);
    $("#medical-report-files").addEventListener("change", renderReview);
    document.querySelectorAll(".add-mark-row").forEach(button => button.addEventListener("click", () => addResultRow(button.dataset.results)));
    buildSubjectChoices(); buildPleCoreResults();
    $("#previous-step").addEventListener("click", () => { step = Math.max(0, step - 1); renderStep(); });
    $("#assessment-form").addEventListener("submit", event => {
      event.preventDefault(); const answer = new FormData(event.currentTarget);
      const score = Number(answer.get("q1") === "30") + Number(answer.get("q2") === "b") + Number(answer.get("q3") === "1/4");
      assessmentComplete = true; $("#application-form").elements.entryAssessment.value = `Practice completed (${score}/3); staff review required`;
      $("#assessment-message").textContent = `Practice complete: ${score}/3. This does not make an admission decision.`;
      setTimeout(() => { close($("#assessment-dialog")); step = 1; renderStep(); }, 700);
    });
    $("#application-form").addEventListener("submit", submit);
    $("#status-lookup-form").addEventListener("submit", lookupApplication);
    $("#track-from-success").addEventListener("click", () => { close($("#success-dialog")); $("#application-tracking").scrollIntoView({behavior:"smooth",block:"center"}); $("#status-phone").focus({preventScroll:true}); });
    document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => {
      const dialog = button.closest("dialog"); if (dialog) close(dialog);
    }));
    $("#download-rules").addEventListener("click", downloadRules);
    $("#assistant-launcher").addEventListener("click", () => open($("#assistant-dialog")));
    $("#assistant-form").addEventListener("submit", askAssistant);
    populateNationalities();
    renderStep();
  }
  init();
})();
