(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const STORE = "noemion.epic2.frontend-demo.v1";
  const PREVIEW = "noemion.epic2.staff-demo-session";
  const seed = {
    applications: [
      { id: "APP-2026-0101", firstName: "Amara", lastName: "Nansubuga", level: "Primary", programme: "Primary 5", entryClass: "Primary 5", studyMode: "Boarding", guardianName: "Sarah Nansubuga", guardianPhone: "+256 700 000 101", guardianRelationship: "Mother", dateOfBirth: "2015-03-12", nationality: "Ugandan", gender: "Female", homeAddress: "Nakawa, Kampala", previousSchool: "Community Primary School", previousClass: "P4", documents: ["previous-report.pdf"], submittedAt: new Date().toISOString(), status: "Under review", admissionNumber: "", note: "" },
      { id: "APP-2026-0102", firstName: "Michael", lastName: "Kato", level: "Secondary", programme: "Senior 1", entryClass: "Senior 1", studyMode: "Boarding", guardianName: "James Kato", guardianPhone: "+256 700 000 102", guardianRelationship: "Father", dateOfBirth: "2013-08-22", nationality: "Ugandan", gender: "Male", homeAddress: "Mukono", previousSchool: "Bright Future Primary", previousClass: "Primary 7", documents: ["ple-results.pdf"], submittedAt: new Date(Date.now() - 86400000).toISOString(), status: "New", admissionNumber: "", note: "" },
      { id: "APP-2026-0103", firstName: "Grace", lastName: "Namara", level: "Vocational", programme: "Certificate in ICT", entryClass: "Certificate", studyMode: "Night", guardianName: "Grace Namara", guardianPhone: "+256 700 000 103", guardianRelationship: "Self (adult applicant)", dateOfBirth: "2003-11-08", nationality: "Ugandan", gender: "Female", homeAddress: "Mbarara", previousSchool: "Mbarara High School", previousClass: "Senior 4", documents: ["uce-certificate.pdf"], submittedAt: new Date(Date.now() - 172800000).toISOString(), status: "Offer issued", admissionNumber: "NTA-2027-0001", note: "" }
    ],
    modules: [
      { id: "mod-1", name: "Online applications & biodata", group: "Admissions", levels: ["Primary", "Secondary", "Vocational", "Tertiary"], enabled: true },
      { id: "mod-2", name: "Previous school records & document checklist", group: "Admissions", levels: ["Primary", "Secondary"], enabled: true },
      { id: "mod-3", name: "Online entry assessment", group: "Admissions", levels: ["Vocational", "Tertiary"], enabled: true },
      { id: "mod-4", name: "Study arrangement & accommodation preferences", group: "Student services", levels: ["Primary", "Secondary", "Vocational", "Tertiary"], enabled: true },
      { id: "mod-5", name: "Dormitory allocation & roll call", group: "Student services", levels: ["Primary", "Secondary"], enabled: true },
      { id: "mod-6", name: "Hostel allocation", group: "Student services", levels: ["Vocational", "Tertiary"], enabled: true },
      { id: "mod-7", name: "Restricted health & emergency cards", group: "Student services", levels: ["Primary", "Secondary", "Vocational", "Tertiary"], enabled: true }
    ],
    events: [
      { id: "event-1", title: "Placement assessment", date: "2026-11-04", audience: "Primary & secondary", details: "Main campus · 9:00 AM", description: "Admissions placement assessment." },
      { id: "event-2", title: "New student orientation", date: "2026-11-07", audience: "School-wide", details: "Main hall · 10:30 AM", description: "Orientation for newly admitted learners and families." },
      { id: "event-3", title: "Vocational open day", date: "2026-11-12", audience: "Vocational", details: "Skills campus · 8:00 AM", description: "Explore skills programmes and schedules." }
    ],
    notices: [
      { id: "notice-1", title: "Term I applications are open", audience: "Applicants & guardians", date: "2026-10-31", description: "Online applications are open for Primary, Secondary, Vocational and Tertiary programmes." },
      { id: "notice-2", title: "New student orientation", audience: "School-wide", date: "2026-10-29", description: "New learners and their families are welcome on 7 November." }
    ],
    incidents: [],
    transportChecks: [],
    rollCall: {}
  };
  let data = load();
  let area = "workplace";
  let view = "overview";
  let reviewId = "";
  let profileId = "";
  let simpleKind = "";
  let toastTimer;
  const rooms = [
    { id: "primary-junior", name: "Junior Dormitory", level: "Primary", capacity: 36 },
    { id: "secondary-pearl", name: "Pearl Dormitory", level: "Secondary", capacity: 36 },
    { id: "secondary-acacia", name: "Acacia Dormitory", level: "Secondary", capacity: 36 },
    { id: "vocational-skills", name: "Skills Hostel · Block B", level: "Vocational", capacity: 24 },
    { id: "tertiary-east", name: "Campus Hostel · East", level: "Tertiary", capacity: 28 }
  ];
  const houses = ["Africa", "Asia", "Europe", "Americas", "Oceania", "Other / school house"];
  let welfareKind = "";

  function load() {
    try {
      const loaded = { ...structuredClone(seed), ...JSON.parse(sessionStorage.getItem(STORE) || "{}") };
      loaded.modules = (loaded.modules || []).filter(module => module.id !== "mod-8" && module.name !== "Online classes & course resources");
      for (const applicant of loaded.applications || []) {
        if (applicant.id === "APP-2026-0102" && applicant.previousClass === "PLE") applicant.previousClass = "Primary 7";
        if (applicant.id === "APP-2026-0103") {
          if (applicant.previousClass === "UCE") applicant.previousClass = "Senior 4";
          if (applicant.studyMode === "Evening") applicant.studyMode = "Night";
        }
      }
      return loaded;
    } catch { return structuredClone(seed); }
  }
  function save(message) { try { sessionStorage.setItem(STORE, JSON.stringify(data)); renderAll(); if (message) toast(message); } catch { toast("Could not save the browser-session preview."); } }
  function esc(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
  function name(applicant) { return [applicant.firstName, applicant.otherNames, applicant.lastName].filter(Boolean).join(" "); }
  function initials(applicant) { return ((applicant.firstName || "?")[0] + (applicant.lastName || "?")[0]).toUpperCase(); }
  function date(value, options = { day: "2-digit", month: "short" }) { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-UG", options); }
  function toast(message) { const node = $("#settings-toast"); node.textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => node.textContent = "", 2800); }
  function open(id) { const dialog = $("#" + id); if (dialog && !dialog.open) dialog.showModal(); }
  function close(id) { const dialog = $("#" + id); if (dialog?.open) dialog.close(); }
  function setArea(next) {
    area = next;
    document.body.dataset.adminArea = next;
    $("#workplace-content").hidden = next !== "workplace";
    $("#setup-content").hidden = next !== "setup";
    $$("[data-admin-area]").forEach(button => button.classList.toggle("active", button.dataset.adminArea === next));
    $("#admin-page-title").textContent = next === "setup" ? "Admissions setup dashboard" : "Admissions workplace";
    renderAll();
  }
  function setView(next) {
    view = next;
    $$(".work-view").forEach(section => section.classList.toggle("active", section.id === "staff-view-" + next));
    $$("[data-workspace-view]").forEach(button => button.classList.toggle("active", button.dataset.workspaceView === next));
    renderAll(); window.scrollTo(0, 0);
  }
  function accepted() { return data.applications.filter(item => item.status === "Offer issued" || item.status === "Enrolled"); }
  function statusClass(status) { return "status-" + (status || "new").toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, ""); }
  function tableRow(applicant, small = false) {
    const who = `<div class="applicant-cell"><span class="initials">${esc(initials(applicant))}</span><span><b>${esc(name(applicant))}</b><small>${esc(applicant.id)}</small></span></div>`;
    if (small) return `<tr><td>${who}</td><td>${esc(applicant.level)} · ${esc(applicant.programme)}</td><td>${esc(date(applicant.submittedAt))}</td><td><span class="status ${statusClass(applicant.status)}">${esc(applicant.status)}</span></td><td><button class="row-button" data-review-app="${esc(applicant.id)}">Review</button></td></tr>`;
    return `<tr><td>${who}</td><td>${esc(applicant.level)} · ${esc(applicant.programme)}</td><td>${esc(applicant.studyMode || "—")}</td><td>${esc(applicant.guardianName || "—")}<small class="muted-cell">${esc(applicant.guardianPhone || "")}</small></td><td>${esc(date(applicant.submittedAt))}</td><td><span class="status ${statusClass(applicant.status)}">${esc(applicant.status)}</span></td><td><button class="row-button" data-review-app="${esc(applicant.id)}">Review</button></td></tr>`;
  }
  function renderMetrics() {
    const apps = data.applications || [];
    const pending = apps.filter(app => ["New", "Under review", "More information"].includes(app.status)).length;
    $("#work-total").textContent = apps.length;
    $("#work-review").textContent = pending;
    $("#work-offers").textContent = apps.filter(app => app.status === "Offer issued").length;
    $("#work-enrolled").textContent = apps.filter(app => app.status === "Enrolled").length;
    const levels = ["Primary", "Secondary", "Vocational", "Tertiary"];
    $("#activity-summary").innerHTML = levels.map(level => { const count = apps.filter(app => app.level === level).length; return `<div class="activity-level"><span>${level}</span><i><b style="width:${Math.min(100, count / Math.max(1, apps.length) * 100)}%"></b></i><small>${count}</small></div>`; }).join("");
    $("#work-chart").innerHTML = `<svg viewBox="0 0 500 110" role="img" aria-label="Applications received by pathway"><line x1="0" y1="100" x2="500" y2="100" stroke="var(--line)"/>${levels.map((level, index) => { const count = apps.filter(app => app.level === level).length; const x = 30 + index * 120; const height = Math.max(4, count / Math.max(1, apps.length) * 82); return `<rect x="${x}" y="${100-height}" width="50" height="${height}" rx="6" fill="var(--brand)" opacity=".${8-index}"/><text x="${x+25}" y="108" text-anchor="middle" fill="var(--muted)" font-size="9">${level}</text>`; }).join("")}</svg>`;
    $("#assistant-summary").textContent = pending ? `${pending} application(s) need review. ${apps.filter(app => app.level === "Primary").length} Primary, ${apps.filter(app => app.level === "Secondary").length} Secondary and ${apps.filter(app => ["Vocational", "Tertiary"].includes(app.level)).length} Vocational / Tertiary application(s) are in this browser session.` : "No applications are waiting for review. Check the next intake dates and programme setup.";
  }
  function renderApplications() {
    const q = ($("#work-search")?.value || "").toLowerCase().trim();
    const level = $("#work-level-filter")?.value || "all";
    const status = $("#work-status-filter")?.value || "all";
    const items = data.applications.filter(app => (!q || `${name(app)} ${app.id}`.toLowerCase().includes(q)) && (level === "all" || app.level === level) && (status === "all" || app.status === status));
    $("#work-applications").innerHTML = items.map(app => tableRow(app)).join("");
    $("#work-applications-empty").hidden = items.length > 0;
    const recent = [...data.applications].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5);
    $("#work-recent").innerHTML = recent.map(app => tableRow(app, true)).join("");
    $("#work-recent-empty").hidden = recent.length > 0;
  }
  function renderStudents() {
    const q = ($("#work-student-search")?.value || "").toLowerCase().trim();
    const students = accepted().filter(app => !q || `${name(app)} ${app.admissionNumber}`.toLowerCase().includes(q));
    $("#work-students").innerHTML = students.map(app => {const placement=app.placement||{};return `<article class="work-student"><span class="initials">${esc(initials(app))}</span><div><b>${esc(name(app))}</b><small>${esc(app.admissionNumber || app.id)} · ${esc(app.level)} / ${esc(app.programme)}${placement.stream?` · ${esc(placement.stream)} stream`:""}${placement.house?` · ${esc(placement.house)} house`:""}</small></div><button class="row-button" data-profile-student="${esc(app.id)}">Open profile</button></article>`;}).join("");
    $("#work-students-empty").hidden = students.length > 0;
  }
  function openAllocation(roomId="") {
    const learners=accepted();const selectedRoom=rooms.find(room=>room.id===roomId)||rooms[0];
    $("#allocation-room-description").textContent=selectedRoom?`${selectedRoom.level} · ${selectedRoom.name}. Choose an admitted learner and assign a bed.`:"Choose an available room and admitted learner.";
    $("#allocation-fields").innerHTML=`<label>Learner *<select name="studentId" required>${learners.map(app=>`<option value="${esc(app.id)}">${esc(name(app))} · ${esc(app.level)} · ${esc(app.admissionNumber||app.id)}</option>`).join("")}</select></label><label>Room / dormitory *<select name="roomId" required>${rooms.map(room=>`<option value="${esc(room.id)}" ${room.id===selectedRoom?.id?"selected":""}>${esc(room.level)} · ${esc(room.name)}</option>`).join("")}</select></label><label>Class / course<input name="className" placeholder="Learner’s current class or course"></label><label>Stream<input name="stream" placeholder="e.g. Blue"></label><label>House<select name="house"><option value="">Select a house (optional)</option>${houses.map(house=>`<option>${esc(house)}</option>`).join("")}</select></label><label>Room number *<input name="room" required placeholder="e.g. 12"></label><label>Bed number *<input name="bed" required placeholder="e.g. B3"></label>${learners.length?"":"<p class=\"wide empty-config\">There are no approved students in this browser preview. Approve an application first.</p>"}`;
    $("#allocation-dialog").dataset.roomId=selectedRoom?.id||"";$("#allocation-form").querySelector("button.primary").disabled=!learners.length;open("allocation-dialog");
    refreshAllocationLearners();
  }
  function refreshAllocationLearners() {
    const form=$("#allocation-form");if(!form.elements.roomId||!form.elements.studentId)return;const room=rooms.find(item=>item.id===form.elements.roomId.value);const matching=accepted().filter(app=>!room||app.level===room.level);const select=form.elements.studentId;const selected=select.value;
    select.innerHTML=matching.length?matching.map(app=>`<option value="${esc(app.id)}" ${app.id===selected?"selected":""}>${esc(name(app))} · ${esc(app.admissionNumber||app.id)}</option>`).join(""):`<option value="">No admitted ${esc(room?.level||"")} students available</option>`;
    form.querySelector("button.primary").disabled=!matching.length;
  }
  function studentSelectMarkup() { const learners=accepted();return `<label class="wide">Learner *<select name="studentId" required>${learners.map(app=>`<option value="${esc(app.id)}">${esc(name(app))} · ${esc(app.level)} · ${esc(app.admissionNumber||app.id)}</option>`).join("")}</select></label>`; }
  function openWelfareForm(kind) {
    welfareKind=kind;const students=accepted();const today=new Date().toISOString().slice(0,10);
    if(kind==="incident"){$("#welfare-dialog-title").textContent="Add discipline incident";$("#welfare-dialog-note").textContent="Restricted preview. Keep this factual and do not add sensitive safeguarding details.";$("#welfare-fields").innerHTML=`${studentSelectMarkup()}<label>Category *<select name="type"><option>Attendance</option><option>Conduct</option><option>Safety concern</option><option>Property</option><option>Other</option></select></label><label>Date *<input name="date" type="date" value="${today}" required></label><label>Status *<select name="status"><option>Open</option><option>Follow-up</option><option>Closed</option></select></label><label class="wide">Brief factual summary *<textarea name="summary" rows="3" required></textarea></label>`;}
    else{$("#welfare-dialog-title").textContent="Add transport check";$("#welfare-dialog-note").textContent="Record the route and confirm contact and guardian consent.";$("#welfare-fields").innerHTML=`${studentSelectMarkup()}<label>Route / stop<input name="route" placeholder="Route or pickup point"></label><label>Pickup contact<input name="pickupContact" placeholder="Name or phone reference"></label><label class="check-option"><input type="checkbox" name="pickupConfirmed"> Pickup contact verified</label><label class="check-option"><input type="checkbox" name="consent"> Guardian transport consent recorded</label><label>Date checked<input name="date" type="date" value="${today}"></label>`;}
    $("#welfare-dialog").dataset.kind=kind;$("#welfare-form").querySelector("button.primary").disabled=!students.length;open("welfare-dialog");
  }
  function renderModules() {
    $("#work-modules").innerHTML = data.modules.map(module => `<article class="work-module ${module.enabled ? "" : "off"}"><header><div><small>${esc(module.group)}</small><h2>${esc(module.name)}</h2></div><label><input type="checkbox" data-module-toggle="${esc(module.id)}" ${module.enabled ? "checked" : ""}> ${module.enabled ? "On" : "Off"}</label></header><p>${module.levels.map(level => `<span>${esc(level)}</span>`).join(" ")}</p><footer><button class="row-button" data-edit-module="${esc(module.id)}">Edit</button><button class="row-button danger-text" data-delete-module="${esc(module.id)}">Delete</button></footer></article>`).join("");
  }
  function renderWelfare() {
    const learners=accepted();const boarders=learners.filter(app=>app.placement?.accommodation);const today=new Date().toISOString().slice(0,10);const todaysRoll=data.rollCall[today]||{};const openIncidents=(data.incidents||[]).filter(item=>item.status!=="Closed").length;
    $("#welfare-placed-count").textContent=boarders.length;$("#welfare-available-count").textContent=rooms.reduce((sum,room)=>sum+Math.max(0,room.capacity-boarders.filter(app=>app.placement.accommodation===room.name).length),0);$("#welfare-unmarked-count").textContent=boarders.filter(app=>!todaysRoll[app.id]).length;$("#welfare-open-cases").textContent=openIncidents;
    $("#work-rooms").innerHTML=rooms.map(room=>{const occupants=boarders.filter(app=>app.placement.accommodation===room.name);const full=occupants.length>=room.capacity;return `<div class="work-room"><b>${esc(room.name)}</b><small>${esc(room.level)} · ${occupants.length}/${room.capacity} beds assigned</small><div>${Array.from({length:Math.min(room.capacity,36)},(_,bed)=>`<i class="${bed<occupants.length?"filled":"free"}"></i>`).join("")}</div>${occupants.length?`<small class="room-occupants">${occupants.map(app=>`${esc(name(app))} · room ${esc(app.placement.room||"—")} · bed ${esc(app.placement.bed||"—")}`).join("<br>")}</small>`:""}<button class="row-button" data-room="${esc(room.id)}" ${full?"disabled":""}>Allocate learner</button></div>`;}).join("");
    $("#work-rollcall").innerHTML=boarders.length?`<div class="rollcall-date">${esc(date(today,{day:"2-digit",month:"long",year:"numeric"}))} · ${boarders.length} placed boarder(s)</div><div class="table-scroll"><table><thead><tr><th>LEARNER</th><th>HOUSE / ROOM</th><th>ATTENDANCE</th><th></th></tr></thead><tbody>${boarders.map(app=>{const status=todaysRoll[app.id]||"Not marked";return `<tr><td>${esc(name(app))}<small class="muted-cell">${esc(app.admissionNumber||app.id)}</small></td><td>${esc(app.placement.house||"House not assigned")} · ${esc(app.placement.accommodation)} · room ${esc(app.placement.room||"—")} · bed ${esc(app.placement.bed||"—")}</td><td><span class="status ${status==="Present"?"status-enrolled":status==="Absent"?"status-withdrawn":"status-under-review"}">${esc(status)}</span></td><td><button class="row-button" data-roll="${esc(app.id)}">${status==="Present"?"Mark absent":"Mark present"}</button></td></tr>`;}).join("")}</tbody></table></div>`:`<div class="empty-config">No learners have a dormitory or hostel assignment yet. Allocate a boarding place to add them to roll call.</div>`;
    const incidents=data.incidents||[];$("#work-incident-list").innerHTML=incidents.length?incidents.slice().reverse().map(item=>{const app=learners.find(student=>student.id===item.studentId);return `<div class="work-event"><b>${esc(item.type)} · ${esc(app?name(app):"Student record unavailable")}</b><small>${esc(item.ref)} · ${esc(date(item.date,{day:"2-digit",month:"short",year:"numeric"}))} · ${esc(item.status)}</small><p>${esc(item.summary)}</p></div>`;}).join(""):`<div class="empty-config">No incident records in this preview.</div>`;
    const checks=data.transportChecks||[];$("#work-transport-list").innerHTML=checks.length?checks.slice().reverse().map(item=>{const app=learners.find(student=>student.id===item.studentId);return `<div class="work-event"><b>${esc(app?name(app):"Student record unavailable")} · ${esc(item.route||"Route not set")}</b><small>Pickup contact: ${item.pickupConfirmed?"Confirmed":"Pending"} · Guardian consent: ${item.consent?"Recorded":"Pending"} · ${esc(date(item.date))}</small></div>`;}).join(""):`<div class="empty-config">No transport checks in this preview.</div>`;
  }
  function renderEvents() {
    $("#upcoming-mini").innerHTML = data.events.slice(0,2).map(item=>`<div class="work-event"><b>${esc(item.title)}</b><small>${esc(date(item.date))} · ${esc(item.details)}</small></div>`).join("");
    $("#work-events").innerHTML = data.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(item=>`<div class="work-event"><b>${esc(item.title)}</b><small>${esc(date(item.date,{day:"2-digit",month:"short",year:"numeric"}))} · ${esc(item.audience)} · ${esc(item.details)}</small><button class="text-button" data-remove-event="${esc(item.id)}">Remove</button></div>`).join("") || '<div class="empty-config">No school events.</div>';
    $("#work-notices").innerHTML = data.notices.map(item=>`<div class="work-event"><b>${esc(item.title)}</b><small>${esc(item.audience)} · ${esc(date(item.date))}</small><p>${esc(item.description)}</p><button class="text-button" data-remove-notice="${esc(item.id)}">Remove notice</button></div>`).join("") || '<div class="empty-config">No announcements.</div>';
  }
  function renderAll() { renderMetrics(); renderApplications(); renderStudents(); renderModules(); renderWelfare(); renderEvents(); }
  function review(id) {
    const app = data.applications.find(item=>item.id===id); if (!app) return;
    reviewId=id; $("#work-review-name").textContent=name(app); $("#work-review-ref").textContent=`${app.id} · ${app.level} / ${app.programme} · ${app.status}`; $("#work-review-note").value=app.note||"";
    const gradeSummary=(app.pleResults||[]).map(item=>`${item.subject}: ${item.grade}`).join(", ")||((app.pleAggregate||app.pleAggregate===0)?`PLE aggregate estimate: ${app.pleAggregate}`:"");
    const items=[["Learner",name(app)],["DOB",app.dateOfBirth],["Level & entry",`${app.level} · ${app.programme} · ${app.studyMode}`],["Father",`${app.fatherName||"Not provided"} · ${app.fatherPhone||""}`],["Mother",`${app.motherName||"Not provided"} · ${app.motherPhone||""}`],["Additional guardian",`${app.guardianName||"Not provided"} · ${app.guardianPhone||""}`],["Home address",app.homeAddress],["Previous school",`${app.previousSchool||"Not provided"} · ${app.previousClass||""}`],["PLE results",gradeSummary],["Supporting documents",(app.documents||[]).join(", ")||"None listed"],["Medical reports","Restricted health documents · authorised health staff only"],["Entry assessment",app.entryAssessment||"Not required"]];
    $("#work-review-details").innerHTML=items.map(([key,value])=>`<div class="review-item"><small>${esc(key)}</small><b>${esc(value||"Not provided")}</b></div>`).join(""); $("#work-approve").textContent=app.status==="Offer issued"?"View admission offer":"Approve & issue offer"; open("work-review-dialog");
  }
  function letter(app) {
    const templates = {
      Primary: { title: "PRIMARY SCHOOL ADMISSION LETTER", body: "Your learner is offered a place in the selected primary class. Please bring the learner’s birth or age record, previous school report and any requested immunisation record when reporting. The school will share class, uniform and family communication guidance." },
      Secondary: { title: "SECONDARY SCHOOL ADMISSION LETTER", body: "Your learner is offered a place in the selected secondary class. Please bring verified PLE or previous-school results and academic records when reporting. Senior 5 and Senior 6 subject choices will be confirmed with the school." },
      Vocational: { title: "VOCATIONAL PROGRAMME ADMISSION LETTER", body: "You are offered a place in the selected vocational course. Bring verified UCE or UACE results and certificates. Course-specific equipment, workshop safety and orientation instructions will be provided before classes begin." },
      Tertiary: { title: "TERTIARY PROGRAMME ADMISSION LETTER", body: "You are offered a place in the selected certificate or diploma programme. Bring verified academic certificates and transcripts. Programme orientation, course registration and reporting guidance will be provided by the college." }
    };
    const template = templates[app.level] || { title: "ADMISSION OFFER", body: "Please contact the admissions office for programme-specific reporting guidance." };
    let config = {}; try { config = JSON.parse(localStorage.getItem("noemion.epic2.pathway-settings.v1") || "{}")[app.level] || {}; } catch {}
    const fees = app.fees
      ? [["admission","Admission fee"],["tuition","Tuition"],["uniform","Uniform"],["other","Other fees"]].filter(([key])=>Number(app.fees[key])>0).map(([key,title])=>({title,amount:app.fees[key]}))
      : (config.fees || []).filter(item => Number(String(item.amount || "").replace(/,/g, "")) > 0);
    const feeMarkup = fees.length ? "<h2>Published fee information</h2><ul>" + fees.map(item => "<li>" + esc(item.title) + ": UGX " + Number(String(item.amount).replace(/,/g, "")).toLocaleString("en-UG") + (item.date ? " · " + esc(item.date) : "") + "</li>").join("") + "</ul>" : "<p><b>Fees:</b> Please obtain the current approved fee schedule and payment instructions from admissions before paying.</p>";
    const addressee = app.guardianName || app.fatherName || app.motherName || name(app);
    const placement=app.placement||{};const placementText=[placement.stream&&`Stream: ${esc(placement.stream)}`,placement.house&&`House: ${esc(placement.house)}`,placement.accommodation&&`Accommodation: ${esc(placement.accommodation)}`,placement.room&&`Room: ${esc(placement.room)}`,placement.bed&&`Bed: ${esc(placement.bed)}`].filter(Boolean).join("<br>");
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(template.title)} · ${esc(app.admissionNumber)}</title><style>body{font:16px/1.7 Georgia,serif;color:#172033;max-width:760px;margin:40px auto;padding:35px;border:1px solid #d6dce7}header{text-align:center;border-bottom:3px solid #2842b7;padding-bottom:15px}h1{font:700 25px Arial;color:#2842b7}h2{font:700 17px Arial;color:#2842b7;margin-top:28px}.sign{margin-top:48px}.meta{background:#f2f4fb;padding:14px}</style></head><body><header><h1>NOEMION SCHOOL</h1><b>${esc(template.title)}</b><br>Uganda · Admissions Office</header><p>${esc(date(new Date().toISOString(),{day:"2-digit",month:"long",year:"numeric"}))}</p><p>Dear ${esc(addressee)},</p><p>We are pleased to offer <b>${esc(name(app))}</b> admission to <b>${esc(app.programme)}</b> in the ${esc(app.level)} section for the ${esc(app.academicYear||"upcoming")} academic year.</p><p class="meta"><b>Admission number:</b> ${esc(app.admissionNumber)}<br><b>Class / course:</b> ${esc(app.programme)}<br><b>Study arrangement:</b> ${esc(app.studyMode||"To be confirmed")}${placementText?"<br>"+placementText:""}</p><p>${esc(template.body)}</p>${feeMarkup}<p>Please confirm reporting dates with the school. Bring original academic and identity records for verification.</p><p>We look forward to welcoming you to Noemion School.</p><p class="sign">Yours faithfully,<br><b>Registrar</b><br>Noemion School</p><small>Frontend draft. Confirm approved school details, fee schedule, dates and authorised signature before official use.</small></body></html>`;
  }
  function approve() {
    const app=data.applications.find(item=>item.id===reviewId); if(!app)return;
    app.note=$("#work-review-note").value.trim(); app.status="Offer issued";
    if(!app.admissionNumber) app.admissionNumber=`NTA-${new Date().getFullYear()+1}-${String(data.applications.filter(item=>item.admissionNumber).length+1).padStart(4,"0")}`;
    save("Offer issued · "+app.admissionNumber); close("work-review-dialog"); profile(app.id);
  }
  function profile(id) {
    const app=data.applications.find(item=>item.id===id);if(!app)return;profileId=id;
    $("#work-profile-name").textContent=name(app);$("#work-profile-ref").textContent=`${app.admissionNumber||app.id} · ${app.level} / ${app.programme}`;
    const placement=app.placement||{};const ledger=app.fees||{};const chargeKeys=["admission","tuition","uniform","other"];const feeNames={admission:"Admission fee",tuition:"Tuition",uniform:"Uniform",other:"Other fees"};const totalDue=chargeKeys.reduce((sum,key)=>sum+(Number(ledger[key])||0),0);const paid=chargeKeys.reduce((sum,key)=>sum+(Number(ledger[key+"Paid"])||0),0);const balance=Math.max(0,totalDue-paid);const transactions=ledger.transactions||[];
    const sections=[["Biodata",[["Full name",name(app)],["Date of birth",app.dateOfBirth],["Gender",app.gender],["Nationality",app.nationality],["Address",app.homeAddress]]],["Guardians",[["Father",app.fatherName],["Father contact",app.fatherPhone],["Mother",app.motherName],["Mother contact",app.motherPhone],["Other guardian",app.guardianName],["Emergency contact",app.emergencyContact]]],["Academics",[["Pathway",app.level],["Class / course",app.programme],["Previous school",app.previousSchool],["Last class / qualification",app.previousClass],["Records",(app.documents||[]).join(", ")]]],["Placement",[["Class / course",placement.className||app.programme],["Stream",placement.stream],["House",placement.house],["Boarding / hostel",placement.accommodation],["Room",placement.room],["Bed",placement.bed]]],["Fees & payments",[...chargeKeys.map(key=>[feeNames[key],`${money(ledger[key])} due · ${money(ledger[key+"Paid"])} paid · ${money(Math.max(0,(Number(ledger[key])||0)-(Number(ledger[key+"Paid"])||0)))} balance`]),["Total charges",money(totalDue)],["Payments received",money(paid)],["Outstanding balance",money(balance)]]],["Welfare",[["Study arrangement",app.studyMode],["Health data","Restricted nurse workflow; no health notes in this frontend."],["Emergency contact",app.emergencyContact]]]];
    const tabs=`<div class="profile-tabs">${sections.map(([label,index],tab)=>`<button class="profile-tab ${tab===0?"active":""}" data-profile-tab="${tab}">${label}</button>`).join("")}</div>`;
    const panels=sections.map(([title,fields],index)=>{let extra="";if(index===3)extra=`<form class="profile-edit-form" data-profile-form="placement"><label>Class / course<input name="className" value="${esc(placement.className||app.programme||"")}"></label><label>Stream<input name="stream" value="${esc(placement.stream||"")}" placeholder="e.g. Blue"></label><label>House<input name="house" value="${esc(placement.house||"")}" placeholder="e.g. Africa"></label><button class="button primary">Save class, stream &amp; house</button><small>Use Boarding &amp; Welfare to assign the dormitory/hostel, room and bed.</small></form>`;if(index===4)extra=`<form class="profile-edit-form fee-edit-form" data-profile-form="fees">${chargeKeys.map(key=>`<label>${feeNames[key]} due (UGX)<input name="${key}" type="number" min="0" step="1" value="${esc(ledger[key]||"")}"></label><label>${feeNames[key]} paid (UGX)<input name="${key}Paid" type="number" min="0" step="1" value="${esc(ledger[key+"Paid"]||"")}"></label>`).join("")}<button class="button primary">Save fee summary to this student</button><small>Total balance due: ${money(balance)}. A manual entry here is not a receipt or payment transaction.</small></form><h4 class="profile-subheading">Record a payment</h4><form class="profile-edit-form fee-edit-form" data-profile-form="payment"><label>Fee category<select name="category">${chargeKeys.map(key=>`<option value="${key}">${feeNames[key]}</option>`).join("")}</select></label><label>Amount received (UGX)<input name="amount" type="number" min="1" step="1" required></label><label>Payment date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></label><label>Method<select name="method"><option>Cash</option><option>Bank</option><option>Mobile money</option><option>Other</option></select></label><label class="wide">Reference / receipt number<input name="reference" placeholder="Optional reference"></label><button class="button primary">Add payment entry</button><small>Preview ledger only. Confirm the payment and issue an official receipt through the school finance process.</small></form><h4 class="profile-subheading">Payment history</h4>${transactions.length?`<div class="table-scroll"><table><thead><tr><th>DATE</th><th>CATEGORY</th><th>METHOD</th><th>REFERENCE</th><th>AMOUNT</th></tr></thead><tbody>${transactions.slice().reverse().map(item=>`<tr><td>${esc(date(item.date))}</td><td>${esc(feeNames[item.category]||item.category)}</td><td>${esc(item.method)}</td><td>${esc(item.reference||"—")}</td><td>${money(item.amount)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-config">No payment entries recorded in this preview.</div>`}`;return `<section class="profile-section ${index===0?"active":""}" data-profile-section="${index}"><h3>${title}</h3><div class="profile-grid">${fields.map(([label,value])=>`<span>${esc(label)}<b>${esc(value||"Not recorded")}</b></span>`).join("")}</div>${extra}</section>`;}).join("");
    $("#work-profile-content").innerHTML=tabs+panels;
    $("#work-letter-preview").innerHTML=app.admissionNumber?`<div class="preview-label">ADMISSION LETTER PREVIEW · ${esc(app.admissionNumber)}</div><iframe title="Admission offer preview" sandbox srcdoc="${esc(letter(app))}"></iframe><p class="work-demo-note">Frontend draft. Confirm the official template and dates before issuing.</p>`:"";
    $("#work-download-letter").hidden=!app.admissionNumber;open("work-profile-dialog");
  }
  function money(value){const amount=Number(value)||0;return amount?"UGX "+amount.toLocaleString("en-UG"):"Not recorded";}
  function downloadLetter() { const app=data.applications.find(item=>item.id===profileId);if(!app?.admissionNumber)return;const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([letter(app)],{type:"text/html;charset=utf-8"}));link.download=`admission-letter-${app.admissionNumber}.html`;link.click();URL.revokeObjectURL(link.href);toast("Letter downloaded; print it or save as PDF."); }
  function simple(kind, existing = {}) {
    simpleKind=kind;const isModule=kind.includes("module");
    const moduleLevel=existing.levels?.length===4?"All levels":existing.levels?.includes("Vocational")&&existing.levels?.includes("Tertiary")?"Vocational + Tertiary":existing.levels?.[0]||"All levels";
    $("#work-simple-title").textContent=kind.startsWith("edit")?"Edit admissions feature":isModule?"Add admissions feature":kind==="notice"?"Add announcement":"Add school event";
    $("#work-simple-fields").innerHTML=isModule?`<label class="wide">Feature name *<input name="name" required value="${esc(existing.name||"")}"></label><label>Group<select name="group"><option>${esc(existing.group||"Admissions")}</option><option>Student services</option><option>Online learning</option><option>Enrolment</option><option>Calendar &amp; notices</option></select></label><label>Available to<select name="level"><option ${moduleLevel==="All levels"?"selected":""}>All levels</option><option ${moduleLevel==="Primary"?"selected":""}>Primary</option><option ${moduleLevel==="Secondary"?"selected":""}>Secondary</option><option ${moduleLevel==="Vocational"?"selected":""}>Vocational</option><option ${moduleLevel==="Tertiary"?"selected":""}>Tertiary</option><option ${moduleLevel==="Vocational + Tertiary"?"selected":""}>Vocational + Tertiary</option></select></label>`:`<label class="wide">Title *<input name="title" required value="${esc(existing.title||"")}"></label><label>Audience<select name="audience"><option>School-wide</option><option>Applicants &amp; guardians</option><option>Primary</option><option>Secondary</option><option>Vocational</option><option>Tertiary</option></select></label><label>Date<input type="date" name="date" value="${esc(existing.date||new Date().toISOString().slice(0,10))}"></label><label>Time / venue<input name="details" value="${esc(existing.details||"")}" placeholder="Main campus · 9:00 AM"></label><label class="wide">Message<textarea name="description" rows="3">${esc(existing.description||"")}</textarea></label>`;
    $("#work-simple-form").dataset.id=existing.id||"";open("work-simple-dialog");
  }
  function saveSimple(event) {
    event.preventDefault();const form=event.currentTarget,values=Object.fromEntries(new FormData(form).entries()),id=form.dataset.id;
    if(simpleKind.includes("module")) { let levels=values.level==="All levels"?["Primary","Secondary","Vocational","Tertiary"]:values.level==="Vocational + Tertiary"?["Vocational","Tertiary"]:[values.level];const item=data.modules.find(row=>row.id===id);if(item)Object.assign(item,{...values,levels});else data.modules.unshift({id:"mod-"+Date.now(),...values,levels,enabled:true}); }
    else if(simpleKind==="notice")data.notices.unshift({id:"notice-"+Date.now(),...values});
    else data.events.push({id:"event-"+Date.now(),...values});
    save("Workspace item saved.");close("work-simple-dialog");
  }
  function saveAllocation(event) {
    event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget).entries());const app=data.applications.find(item=>item.id===values.studentId);const room=rooms.find(item=>item.id===values.roomId);if(!app||!room)return;
    if(app.level!==room.level){toast(`Choose a ${room.level} learner for this room.`);return;}
    const occupants=accepted().filter(item=>item.id!==app.id&&item.placement?.accommodation===room.name);
    if(occupants.length>=room.capacity){toast("This dormitory or hostel has no available beds.");return;}
    const duplicate=occupants.some(item=>String(item.placement.room||"").toLowerCase()===values.room.trim().toLowerCase()&&String(item.placement.bed||"").toLowerCase()===values.bed.trim().toLowerCase());
    if(duplicate){toast("That room and bed are already assigned.");return;}
    app.placement={...(app.placement||{}),className:values.className.trim()||app.programme,stream:values.stream.trim(),house:values.house,accommodation:room.name,room:values.room.trim(),bed:values.bed.trim()};
    save(`Room and house placement saved to ${name(app)}'s record.`);close("allocation-dialog");
  }
  function saveWelfareForm(event) {
    event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form).entries());const app=data.applications.find(item=>item.id===values.studentId);if(!app)return;
    if(form.dataset.kind==="incident"){
      data.incidents=data.incidents||[];data.incidents.push({id:"incident-"+Date.now(),ref:"INC-"+new Date().getFullYear()+"-"+String(data.incidents.length+1).padStart(4,"0"),studentId:app.id,type:values.type,date:values.date,status:values.status,summary:values.summary.trim()});
      save("Incident saved in this browser preview.");
    }else{
      data.transportChecks=data.transportChecks||[];data.transportChecks.push({id:"transport-"+Date.now(),studentId:app.id,route:values.route.trim(),pickupContact:values.pickupContact.trim(),pickupConfirmed:form.elements.pickupConfirmed.checked,consent:form.elements.consent.checked,date:values.date||new Date().toISOString().slice(0,10)});
      save("Transport check saved in this browser preview.");
    }
    close("welfare-dialog");
  }
  function assistant() { const pending=data.applications.filter(item=>["New","Under review","More information"].includes(item.status)).length;const counts=Object.fromEntries(["Primary","Secondary","Vocational","Tertiary"].map(level=>[level,data.applications.filter(item=>item.level===level).length]));const peak=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];alert(`Admissions assistant · local summary\n\n${pending} application(s) need review.\n${peak[0]} currently has the most applications (${peak[1]}).\n\nThis summary runs locally and is not connected to an AI service.`); }
  function renderAll() {
    if (!$("#work-total")) return;
    renderMetrics();renderApplications();renderStudents();renderModules();renderWelfare();renderEvents();
  }
  function bind() {
    $$("[data-admin-area]").forEach(button=>button.addEventListener("click",()=>setArea(button.dataset.adminArea)));
    $("#staff-sidebar-nav").addEventListener("click",event=>{const button=event.target.closest("[data-workspace-view]");if(button)setView(button.dataset.workspaceView);});
    document.addEventListener("click",event=>{
      const go=event.target.closest("[data-open-work-view]");if(go)setView(go.dataset.openWorkView);
      const reviewButton=event.target.closest("[data-review-app]");if(reviewButton)review(reviewButton.dataset.reviewApp);
      const profileButton=event.target.closest("[data-profile-student]");if(profileButton)profile(profileButton.dataset.profileStudent);
      const statusButton=event.target.closest("[data-set-status]");if(statusButton){const app=data.applications.find(item=>item.id===reviewId);if(app){app.status=statusButton.dataset.setStatus;app.note=$("#work-review-note").value.trim();save("Application status updated.");close("work-review-dialog");}}
      const closeButton=event.target.closest("[data-close-work-dialog]");if(closeButton)close(closeButton.closest("dialog").id);
      const edit=event.target.closest("[data-edit-module]");if(edit)simple("edit-module",data.modules.find(item=>item.id===edit.dataset.editModule));
      const remove=event.target.closest("[data-delete-module]");if(remove&&confirm("Remove this module from the workspace preview?")){data.modules=data.modules.filter(item=>item.id!==remove.dataset.deleteModule);save("Feature removed.");}
      const eventRemove=event.target.closest("[data-remove-event]");if(eventRemove&&confirm("Remove this event?")){data.events=data.events.filter(item=>item.id!==eventRemove.dataset.removeEvent);save("Event removed.");}
      const noticeRemove=event.target.closest("[data-remove-notice]");if(noticeRemove&&confirm("Remove this announcement?")){data.notices=data.notices.filter(item=>item.id!==noticeRemove.dataset.removeNotice);save("Announcement removed.");}
      const room=event.target.closest("[data-room]");if(room)openAllocation(room.dataset.room);
      const allocate=event.target.closest("#allocate-boarding-student");if(allocate)openAllocation();
      const rollButton=event.target.closest("[data-roll]");if(rollButton){const today=new Date().toISOString().slice(0,10);data.rollCall[today]=data.rollCall[today]||{};data.rollCall[today][rollButton.dataset.roll]=data.rollCall[today][rollButton.dataset.roll]==="Present"?"Absent":"Present";save("Today’s roll call updated.");}
      const incident=event.target.closest("#add-welfare-incident");if(incident)openWelfareForm("incident");
      const transport=event.target.closest("#add-transport-check");if(transport)openWelfareForm("transport");
      const profileTab=event.target.closest("[data-profile-tab]");if(profileTab){$$('.profile-tab').forEach(item=>item.classList.toggle("active",item===profileTab));$$('[data-profile-section]').forEach(item=>item.classList.toggle("active",item.dataset.profileSection===profileTab.dataset.profileTab));}
    });
    document.addEventListener("change",event=>{const toggle=event.target.closest("[data-module-toggle]");if(toggle){const module=data.modules.find(item=>item.id===toggle.dataset.moduleToggle);if(module){module.enabled=toggle.checked;save(module.name+(module.enabled?" enabled.":" disabled."));}}});
    document.addEventListener("submit",event=>{const form=event.target.closest("[data-profile-form]");if(!form)return;event.preventDefault();const app=data.applications.find(item=>item.id===profileId);if(!app)return;const values=Object.fromEntries(new FormData(form).entries());if(form.dataset.profileForm==="placement"){app.placement={...(app.placement||{}),...Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.trim()]))};save(`Placement saved to ${name(app)}'s profile.`);}else if(form.dataset.profileForm==="fees"){const nextFees=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,Math.max(0,Number(value)||0)]));if(chargeKeys.some(key=>nextFees[key]<(Number(app.fees?.[key+"Paid"])||0))){toast("A fee charge cannot be lower than the amount already recorded as paid.");return;}app.fees={...(app.fees||{}),...nextFees};save(`Fee charges saved to ${name(app)}'s profile.`);}else if(form.dataset.profileForm==="payment"){const category=values.category;const amount=Math.floor(Number(values.amount));const due=Number(app.fees?.[category])||0;const alreadyPaid=Number(app.fees?.[category+"Paid"])||0;if(!Number.isFinite(amount)||amount<1||amount>Math.max(0,due-alreadyPaid)){toast("Enter an amount up to the remaining balance for this fee.");return;}app.fees=app.fees||{};app.fees[category+"Paid"]=alreadyPaid+amount;app.fees.transactions=app.fees.transactions||[];app.fees.transactions.push({category,amount,date:values.date,method:values.method,reference:values.reference.trim()});save(`Payment entry added to ${name(app)}'s preview ledger.`);}profile(app.id);});
    $("#allocation-form").addEventListener("submit",saveAllocation);$("#allocation-form").elements.roomId.addEventListener("change",refreshAllocationLearners);$("#welfare-form").addEventListener("submit",saveWelfareForm);
    $("#work-search").addEventListener("input",renderApplications);$("#work-level-filter").addEventListener("change",renderApplications);$("#work-status-filter").addEventListener("change",renderApplications);$("#work-student-search").addEventListener("input",renderStudents);
    $("#work-approve").addEventListener("click",()=>{const app=data.applications.find(item=>item.id===reviewId);if(!app)return;app.note=$("#work-review-note").value.trim();app.status="Offer issued";if(!app.admissionNumber)app.admissionNumber=`NTA-${new Date().getFullYear()+1}-${String(data.applications.filter(item=>item.admissionNumber).length+1).padStart(4,"0")}`;save("Admission offer prepared · "+app.admissionNumber);close("work-review-dialog");profile(app.id);});
    $("#work-download-letter").addEventListener("click",downloadLetter);$("#add-work-module").addEventListener("click",()=>simple("module"));$("#add-work-event").addEventListener("click",()=>simple("event"));$("#add-work-notice").addEventListener("click",()=>simple("notice"));$("#work-simple-form").addEventListener("submit",saveSimple);$("#refresh-assistant").addEventListener("click",assistant);
  }
  function init() {
    if (!sessionStorage.getItem(STORE)) sessionStorage.setItem(STORE,JSON.stringify(data));
    bind();renderAll();setArea(location.hash==="#setup"?"setup":"workplace");
  }
  init();
})();
