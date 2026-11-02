 (() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const ADMISSIONS_KEY = "noemion.epic2.frontend-demo.v1";
  const STORE = "noemion.epic2.nurse-preview.v1";
  const seed = {
    students: {},
    medicines: [
      { id: "med-1", name: "Paracetamol (sample item)", unit: "tablets", stock: 84, reorder: 30, expiry: "2027-08-31", issues: [] },
      { id: "med-2", name: "Oral rehydration salts (sample item)", unit: "sachets", stock: 18, reorder: 20, expiry: "2027-04-30", issues: [] },
      { id: "med-3", name: "Antiseptic solution (sample item)", unit: "bottles", stock: 9, reorder: 8, expiry: "2027-06-30", issues: [] }
    ]
  };
  let state = load();
  let activeMedicine = "";
  let stockAction = "";
  let toastTimer;

  function load() {
    try { return { ...structuredClone(seed), ...JSON.parse(sessionStorage.getItem(STORE) || "{}") }; }
    catch { return structuredClone(seed); }
  }
  function save(message) {
    try { sessionStorage.setItem(STORE, JSON.stringify(state)); renderAll(); if (message) toast(message); }
    catch { toast("Could not save this browser-session preview."); }
  }
  function esc(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
  function toast(message) { const node = $("#nurse-toast"); node.textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => node.textContent = "", 2800); }
  function students() {
    try {
      const data = JSON.parse(sessionStorage.getItem(ADMISSIONS_KEY) || "{}");
      return (data.applications || []).filter(item => ["Offer issued", "Enrolled"].includes(item.status));
    } catch { return []; }
  }
  function fullName(student) { return [student.firstName, student.otherNames, student.lastName].filter(Boolean).join(" ") || "Student"; }
  function date(value) { if (!value) return "Not set"; const result = new Date(value + "T00:00:00"); return Number.isNaN(result.getTime()) ? value : result.toLocaleDateString("en-UG", { day: "2-digit", month: "short", year: "numeric" }); }
  function currentMonthIssues() { const month = new Date().toISOString().slice(0, 7); return state.medicines.flatMap(item => item.issues || []).filter(issue => issue.date?.slice(0, 7) === month); }
  function statusOf(student) { return state.students[student.id] || { status: "Not reviewed", nextReview: "" }; }
  function statusClass(value) { return String(value || "").toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""); }
  function open(id) { const dialog = $("#" + id); if (dialog && !dialog.open) dialog.showModal(); }
  function close(id) { const dialog = $("#" + id); if (dialog?.open) dialog.close(); }

  function renderOverview() {
    const list = students();
    const needsReview = list.filter(student => ["Follow-up due", "Referred"].includes(statusOf(student).status));
    const low = state.medicines.filter(item => Number(item.stock) <= Number(item.reorder));
    const monthIssues = currentMonthIssues();
    const uniqueStudents = new Set(monthIssues.map(issue => issue.studentId));
    $("#nurse-student-count").textContent = list.length;
    $("#nurse-followup-count").textContent = needsReview.length;
    $("#nurse-low-stock-count").textContent = low.length;
    $("#nurse-served-count").textContent = uniqueStudents.size;
    $("#nurse-followup-list").innerHTML = needsReview.length ? needsReview.map(student => `<div class="nurse-mini-row"><span><b>${esc(fullName(student))}</b><small>${esc(student.id)} · ${esc(student.level)} · review ${esc(date(statusOf(student).nextReview))}</small></span><button class="row-button" data-review-student="${esc(student.id)}">Open</button></div>`).join("") : `<div class="nurse-empty">No student follow-ups are due in this preview.</div>`;
    $("#nurse-low-stock-list").innerHTML = low.length ? low.map(item => `<div class="nurse-mini-row"><span><b>${esc(item.name)}</b><small>${Number(item.stock)} ${esc(item.unit)} on hand · reorder at ${Number(item.reorder)}</small></span><span class="nurse-low-stock">Restock</span></div>`).join("") : `<div class="nurse-empty">No medicines are currently below their reorder levels.</div>`;
  }
  function renderStudents() {
    const query = $("#nurse-student-search").value.trim().toLowerCase();
    const filter = $("#nurse-health-filter").value;
    const list = students().filter(student => {
      const status = statusOf(student).status;
      return (!query || `${fullName(student)} ${student.id}`.toLowerCase().includes(query)) && (filter === "all" || status === filter);
    });
    $("#nurse-students").innerHTML = list.map(student => {
      const health = statusOf(student);
      return `<tr><td><b>${esc(fullName(student))}</b><small class="muted-cell">${esc(student.admissionNumber || student.id)}</small></td><td>${esc(student.level)} · ${esc(student.programme)}</td><td><span class="nurse-status ${statusClass(health.status)}">${esc(health.status)}</span></td><td>${esc(date(health.nextReview))}</td><td><button class="row-button" data-health-card="${esc(student.id)}">Health card</button> <button class="row-button" data-review-student="${esc(student.id)}">Update status</button></td></tr>`;
    }).join("");
    $("#nurse-students-empty").hidden = list.length > 0;
  }
  function renderMedicines() {
    const thisMonth = currentMonthIssues();
    $("#nurse-stock-total").textContent = state.medicines.reduce((sum, item) => sum + Number(item.stock || 0), 0).toLocaleString("en-UG");
    $("#nurse-issued-total").textContent = thisMonth.reduce((sum, issue) => sum + Number(issue.quantity || 0), 0).toLocaleString("en-UG");
    $("#nurse-medicines").innerHTML = state.medicines.map(item => {
      const served = new Set((item.issues || []).map(issue => issue.studentId)).size;
      const low = Number(item.stock) <= Number(item.reorder);
      return `<tr><td><b>${esc(item.name)}</b><small class="muted-cell">${esc(item.unit)}</small></td><td><b class="${low ? "nurse-low-stock" : ""}">${Number(item.stock)} ${low ? " · Restock" : ""}</b></td><td>${Number(item.reorder)} ${esc(item.unit)}</td><td>${esc(date(item.expiry))}</td><td>${served}</td><td><button class="row-button" data-stock="${esc(item.id)}">Receive</button> <button class="row-button" data-issue="${esc(item.id)}">Issue</button></td></tr>`;
    }).join("");
    $("#nurse-medicines-empty").hidden = state.medicines.length > 0;
    const allIssues = state.medicines.flatMap(item => item.issues || []);
    const recent = allIssues.slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 8);
    $("#nurse-issue-log").innerHTML = recent.length ? `<div class="table-scroll"><table><thead><tr><th>DATE</th><th>STUDENT</th><th>MEDICINE</th><th>QUANTITY</th></tr></thead><tbody>${recent.map(issue => {
      const student = students().find(item => item.id === issue.studentId);
      const medicine = state.medicines.find(item => item.id === issue.medicineId);
      return `<tr><td>${esc(date(issue.date))}</td><td>${esc(student ? fullName(student) : "Student record unavailable")}</td><td>${esc(medicine?.name || "Medicine")}</td><td>${Number(issue.quantity)} ${esc(medicine?.unit || "units")}</td></tr>`;
    }).join("")}</tbody></table></div>` : `<div class="nurse-empty">No medicine issues have been recorded in this preview.</div>`;
  }
  function renderAll() { renderOverview(); renderStudents(); renderMedicines(); }
  function setView(view) {
    $$(".nurse-view").forEach(section => section.classList.toggle("active", section.id === "nurse-view-" + view));
    $$('[data-nurse-view]').forEach(button => button.classList.toggle("active", button.dataset.nurseView === view));
    window.scrollTo(0, 0);
  }
  function openStudentReview(id) {
    const student = students().find(item => item.id === id); if (!student) { toast("This student is not available in the admissions preview."); return; }
    const saved = statusOf(student); const form = $("#nurse-record-form");
    form.elements.studentId.value = student.id; form.elements.status.value = saved.status; form.elements.nextReview.value = saved.nextReview || "";
    $("#nurse-record-title").textContent = "Update health status";
    $("#nurse-record-subtitle").textContent = `${fullName(student)} · ${student.admissionNumber || student.id} · ${student.level}`;
    open("nurse-record-dialog");
  }
  function openHealthCard(id) {
    const student=students().find(item=>item.id===id);if(!student){toast("This student is not available in the admissions preview.");return;}
    const health=statusOf(student);const card=student.healthCard||{};const reportData=student.medicalReports||student.healthDocuments||card.documents||[];const reports=Array.isArray(reportData)?reportData:[];const visitData=card.visits||[];const visits=Array.isArray(visitData)?visitData:[];
    $("#nurse-health-card-title").textContent=fullName(student);
    $("#nurse-health-card-subtitle").textContent=`${student.admissionNumber||student.id} · ${student.level} · ${student.programme}`;
    const contacts=[["Father / contact",student.fatherName],["Father phone",student.fatherPhone],["Mother / contact",student.motherName],["Mother phone",student.motherPhone],["Other guardian",student.guardianName],["Emergency contact",student.emergencyContact]];
    const medical=[["Allergies",card.allergies], ["Health conditions",card.conditions], ["Medication plan",card.medications], ["Emergency instructions",card.emergencyInstructions]];
    $("#nurse-health-card-content").innerHTML=`<div class="nurse-health-card-grid"><section><h3>Student &amp; emergency contacts</h3><div class="nurse-health-fields">${[["Learner",fullName(student)],["Date of birth",student.dateOfBirth],["Current status",health.status],["Next review",date(health.nextReview)],...contacts].map(([label,value])=>`<div><small>${esc(label)}</small><b>${esc(value||"Not recorded in preview")}</b></div>`).join("")}</div></section><section><h3>Medical summary</h3><div class="nurse-health-fields">${medical.map(([label,value])=>`<div><small>${esc(label)}</small><b>${esc(value||"No authorised health record connected")}</b></div>`).join("")}</div></section></div><section class="nurse-health-documents"><h3>Uploaded medical reports</h3>${reports.length?`<ul>${reports.map(report=>`<li>${esc(typeof report==="string"?report:report.fileName||report.name||"Medical report")} <small>${esc(typeof report==="object"&&report.uploadedAt?date(report.uploadedAt):"Secure file access requires backend connection")}</small></li>`).join("")}</ul>`:`<p>No medical report is connected to this student in the preview. Application uploads will appear here after secure backend storage is connected.</p>`}</section><section class="nurse-health-documents"><h3>Clinic visit history</h3>${visits.length?`<div class="table-scroll"><table><thead><tr><th>DATE</th><th>VISIT</th><th>FOLLOW-UP</th></tr></thead><tbody>${visits.map(visit=>`<tr><td>${esc(date(visit.date))}</td><td>${esc(visit.summary||"Clinic visit")}</td><td>${esc(visit.followUp||"None recorded")}</td></tr>`).join("")}</tbody></table></div>`:`<p>No clinic visit records are connected in this preview.</p>`}</section>`;
    open("nurse-health-card-dialog");
  }
  function stockDialog(medicineId, action) {
    const medicine = state.medicines.find(item => item.id === medicineId);
    activeMedicine = medicineId || ""; stockAction = action;
    const stockFields = $("#nurse-stock-fields");
    if (action === "add") {
      $("#nurse-stock-title").textContent = "Add clinic stock item";
      $("#nurse-stock-subtitle").textContent = "Create an inventory item in the browser preview.";
      stockFields.innerHTML = `<div class="nurse-stock-form-grid"><label class="wide">Medicine or supply name<input name="name" required placeholder="Enter item name"></label><label>Stock unit<input name="unit" required placeholder="e.g. tablets, packs, bottles"></label><label>Opening stock<input name="quantity" type="number" min="0" step="1" required></label><label>Reorder level<input name="reorder" type="number" min="0" step="1" required></label><label>Expiry date<input name="expiry" type="date"></label></div>`;
    } else if (action === "receive") {
      $("#nurse-stock-title").textContent = "Receive stock";
      $("#nurse-stock-subtitle").textContent = `${medicine?.name || "Medicine"} · Current stock: ${medicine?.stock || 0} ${medicine?.unit || "units"}`;
      stockFields.innerHTML = `<div class="nurse-stock-form-grid"><label class="wide">Quantity received<input name="quantity" type="number" min="1" step="1" required></label><label class="wide">Expiry date for received batch<input name="expiry" type="date" value="${esc(medicine?.expiry || "")}"></label></div>`;
    } else {
      const options = students().map(student => `<option value="${esc(student.id)}">${esc(fullName(student))} · ${esc(student.admissionNumber || student.id)}</option>`).join("");
      $("#nurse-stock-title").textContent = "Record medicine issue";
      $("#nurse-stock-subtitle").textContent = `${medicine?.name || "Medicine"} · Available: ${medicine?.stock || 0} ${medicine?.unit || "units"}`;
      stockFields.innerHTML = `<div class="nurse-stock-form-grid"><label class="wide">Student<select name="studentId" required>${options || "<option value=\"\">No admitted students available</option>"}</select></label><label class="wide">Quantity issued<input name="quantity" type="number" min="1" max="${Number(medicine?.stock || 0)}" step="1" required></label></div>`;
      if (!options) $("#nurse-stock-submit").disabled = true;
    }
    if (action !== "issue") $("#nurse-stock-submit").disabled = false;
    open("nurse-stock-dialog");
  }
  function bind() {
    const theme = $("#nurse-theme");
    try { theme.value = localStorage.getItem("noemion.epic2.theme.v1") || "system"; } catch { theme.value = "system"; }
    document.documentElement.dataset.theme = theme.value;
    theme.addEventListener("change", () => { document.documentElement.dataset.theme = theme.value; try { localStorage.setItem("noemion.epic2.theme.v1", theme.value); } catch {} });
    $$('[data-nurse-view]').forEach(button => button.addEventListener("click", () => setView(button.dataset.nurseView)));
    $$('[data-open-nurse-view]').forEach(button => button.addEventListener("click", () => setView(button.dataset.openNurseView)));
    document.addEventListener("click", event => {
      const review = event.target.closest("[data-review-student]"); if (review) openStudentReview(review.dataset.reviewStudent);
      const healthCard = event.target.closest("[data-health-card]"); if (healthCard) openHealthCard(healthCard.dataset.healthCard);
      const stock = event.target.closest("[data-stock]"); if (stock) stockDialog(stock.dataset.stock, "receive");
      const issue = event.target.closest("[data-issue]"); if (issue) stockDialog(issue.dataset.issue, "issue");
      const add = event.target.closest("#nurse-add-medicine"); if (add) stockDialog("", "add");
      const closer = event.target.closest("[data-close-nurse-dialog]"); if (closer) close(closer.closest("dialog").id);
    });
    $("#nurse-student-search").addEventListener("input", renderStudents);
    $("#nurse-health-filter").addEventListener("change", renderStudents);
    $("#nurse-record-form").addEventListener("submit", event => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.students[values.studentId] = { status: values.status, nextReview: values.nextReview, reviewedAt: new Date().toISOString() };
      save("Student health status updated in this browser preview."); close("nurse-record-dialog");
    });
    $("#nurse-stock-form").addEventListener("submit", event => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const quantity = Math.floor(Number(values.quantity));
      if (!Number.isFinite(quantity) || (stockAction === "add" ? quantity < 0 : quantity < 1)) { toast("Enter a valid quantity."); return; }
      if (stockAction === "add") {
        state.medicines.unshift({ id: "med-" + Date.now(), name: values.name.trim(), unit: values.unit.trim(), stock: quantity, reorder: Math.floor(Number(values.reorder) || 0), expiry: values.expiry, issues: [] });
        save("Medicine item added to this browser preview.");
      } else {
        const medicine = state.medicines.find(item => item.id === activeMedicine); if (!medicine) return;
        if (stockAction === "receive") { medicine.stock = Number(medicine.stock) + quantity; if (values.expiry) medicine.expiry = values.expiry; save("Stock received in this browser preview."); }
        else {
          const student = students().find(item => item.id === values.studentId); if (!student) { toast("Choose an admitted student."); return; }
          if (quantity > Number(medicine.stock)) { toast("Issue quantity is greater than available stock."); return; }
          medicine.stock = Number(medicine.stock) - quantity; medicine.issues = medicine.issues || [];
          medicine.issues.push({ id: "issue-" + Date.now(), medicineId: medicine.id, studentId: student.id, quantity, date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() });
          save("Issue recorded for " + fullName(student) + " in this browser preview.");
        }
      }
      close("nurse-stock-dialog");
    });
  }
  bind(); renderAll();
})();
