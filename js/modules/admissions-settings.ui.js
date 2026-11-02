(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const KEY = "noemion.epic2.pathway-settings.v1";
  const themeKey = "noemion.epic2.theme.v1";
  const baseFields = [
    { title: "Learner full name", detail: "Applicant biodata · Required", enabled: true },
    { title: "Date of birth", detail: "Applicant biodata · Required", enabled: true },
    { title: "Parent / guardian contact", detail: "Guardian details · Required", enabled: true },
    { title: "Previous school & academic history", detail: "Academic history · Optional", enabled: true },
    { title: "Emergency contact", detail: "Student safety · Required", enabled: true },
    { title: "Day or accommodation preference", detail: "Student services · Optional", enabled: true }
  ];
  const starter = {
    Primary: { programmes: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "Primary 7"], fields: structuredClone(baseFields), documents: ["Birth certificate or age evidence", "Parent / guardian identification", "Immunisation record", "Previous school report (if applicable)"], fees: [{ title: "Application fee", amount: "", date: "" }, { title: "Admission fee", amount: "", date: "" }, { title: "Tuition / term fees", amount: "", date: "" }], services: { day: true, boarding: true, night: false, weekend: false, online: false, hostel: false, assessment: false, medicalConsent: true, transport: false, instructions: "Dormitory placement is confirmed by the school after an admission offer." } },
    Secondary: { programmes: ["Senior 1", "Senior 2", "Senior 3", "Senior 4", "Senior 5", "Senior 6"], fields: structuredClone(baseFields), documents: ["Birth / identity record", "Parent / guardian identification", "PLE or UCE results", "Previous school report / transfer record"], fees: [{ title: "Application fee", amount: "", date: "" }, { title: "Admission fee", amount: "", date: "" }, { title: "Tuition / term fees", amount: "", date: "" }], services: { day: true, boarding: true, night: false, weekend: false, online: false, hostel: false, assessment: false, medicalConsent: true, transport: false, instructions: "Day and boarding placement are confirmed by the school after an offer." } },
    Vocational: { programmes: ["Certificate in ICT", "Certificate in Secretaryship", "Stenography and Computer Applications", "Accountancy and Auditing", "Marketing and Salesmanship", "Banking Operations", "Electrical Technology", "Automobile Technology", "Structure and Fabrication Technology", "Air Conditioning and Refrigeration Technology", "Electronics Technology", "Dairying", "Fashion and Design", "Agriculture", "Hospitality"], fields: structuredClone(baseFields).concat([{ title: "Course interest & study schedule", detail: "Programme selection · Required", enabled: true }]), documents: ["National ID or age evidence", "Previous academic certificates", "Programme prerequisite records", "Guardian or emergency contact"], fees: [{ title: "Application fee", amount: "", date: "" }, { title: "Admission fee", amount: "", date: "" }, { title: "Tuition / term fees", amount: "", date: "" }], services: { day: true, boarding: false, night: true, weekend: true, online: true, hostel: true, assessment: true, medicalConsent: true, transport: false, instructions: "Choose Day, Night, Weekend or Online study. Hostel placement is subject to campus availability." } },
    Tertiary: { programmes: ["Diploma in Business", "Diploma in ICT", "Certificate programme"], fields: structuredClone(baseFields).concat([{ title: "Programme & entry qualification", detail: "Programme selection · Required", enabled: true }]), documents: ["National ID", "Academic certificates and transcripts", "Programme prerequisite records", "Guardian or emergency contact"], fees: [{ title: "Application fee", amount: "", date: "" }, { title: "Admission fee", amount: "", date: "" }, { title: "Tuition / term fees", amount: "", date: "" }], services: { day: true, boarding: false, night: true, weekend: true, online: true, hostel: true, assessment: true, medicalConsent: true, transport: false, instructions: "Choose Day, Night, Weekend or Online study. Hostel placement is subject to campus capacity." } }
  };
  starter.Vocational.programmes = ["Certificate in ICT", "Certificate in Secretaryship", "Stenography and Computer Applications", "Accountancy and Auditing", "Marketing and Salesmanship", "Banking Operations", "Electrical Technology", "Automobile Technology", "Structure and Fabrication Technology", "Air Conditioning and Refrigeration Technology", "Electronics Technology", "Dairying", "Fashion and Design", "Agriculture", "Hospitality"];
  starter.Tertiary.programmes = ["Diploma in Secretaryship", "Diploma in Stenography and Computer Applications", "Diploma in Accountancy and Auditing", "Diploma in Marketing and Salesmanship", "Diploma in Banking", "Diploma in Electrical Technology", "Diploma in Automobile Technology", "Diploma in Structure and Fabrication Technology", "Diploma in Air Conditioning and Refrigeration Technology", "Diploma in Electronics Technology", "Diploma in Dairying", "Diploma in ICT", "Certificate in Business Studies", "Certificate in ICT"];
  for (const pathway of Object.keys(starter)) {
    const advanced = ["Vocational", "Tertiary"].includes(pathway);
    const services = starter[pathway].services;
    services.night ??= advanced ? services.evening ?? true : false;
    services.weekend ??= advanced;
    services.online ??= advanced ? services.onlineClass ?? true : false;
    delete services.evening;
    delete services.onlineClass;
  }
  let state = read();
  let level = "Primary";
  let category = "";
  let editIndex = -1;
  let toastTimer;
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}"); const data = structuredClone(starter);
      for (const pathway of Object.keys(starter)) {
        if (!saved[pathway]) continue;
        data[pathway] = { ...data[pathway], ...saved[pathway] };
      const oldFees = Array.isArray(saved[pathway].fees) ? saved[pathway].fees : [];
        data[pathway].fees = starter[pathway].fees.map(item => oldFees.find(old => old.title === item.title) || item).concat(oldFees.filter(old => !starter[pathway].fees.some(item => item.title === old.title)));
      const oldServices = saved[pathway].services || {};
      data[pathway].services = { ...data[pathway].services, ...oldServices };
      if (typeof oldServices.night !== "boolean" && typeof oldServices.evening === "boolean") data[pathway].services.night = oldServices.evening;
      if (typeof oldServices.online !== "boolean" && typeof oldServices.onlineClass === "boolean") data[pathway].services.online = oldServices.onlineClass;
        const advanced = ["Vocational", "Tertiary"].includes(pathway);
        data[pathway].services.night ??= advanced;
        data[pathway].services.weekend ??= advanced;
        data[pathway].services.online ??= advanced;
      delete data[pathway].services.evening;
      delete data[pathway].services.onlineClass;
        if (pathway === "Vocational") {
          const previousDefaults = ["Certificate in ICT", "Electrical Installation", "Fashion & Design", "Agriculture", "Hospitality", "Business Skills"];
          const custom = data[pathway].programmes.filter(item => !previousDefaults.includes(item));
          data[pathway].programmes = [...new Set([...starter.Vocational.programmes, ...custom])];
        }
        if (pathway === "Tertiary") {
          const previousDefaults = ["Diploma in Business", "Diploma in ICT", "Bachelor of Business", "Bachelor of Education", "Certificate programme"];
          const custom = data[pathway].programmes.filter(item => !previousDefaults.includes(item) && !/^bachelor/i.test(item));
          data[pathway].programmes = [...new Set([...starter.Tertiary.programmes, ...custom])];
        }
      }
      return data;
    } catch { return structuredClone(starter); }
  }
  function current() { return state[level]; }
  function esc(value = "") { return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
  function showToast(message) { const node = $("#settings-toast"); node.textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => node.textContent = "", 2800); }
  function initStaffGate() {
    if (sessionStorage.getItem("noemion.epic2.staff-demo-session") === "preview") return;
    const gate = document.createElement("section"); gate.className = "staff-gate"; gate.id = "settings-staff-gate";
    gate.innerHTML = `<div class="gate-card"><span class="brand-logo">N</span><span class="eyebrow">NOEMION · ADMINISTRATOR SIGN-IN</span><h1>Administration workplace</h1><p>Enter your school's workplace credentials to review admissions or configure pathways.</p><form id="settings-login"><label>Work email<input type="email" autocomplete="username" placeholder="admin@school.ug" required></label><label>Password<input type="password" autocomplete="current-password" placeholder="Your password" required></label><button class="button primary">Sign in securely</button></form><p class="gate-message" id="settings-login-message">Authentication is not connected in this frontend prototype. Credentials are not checked, transmitted or stored.</p><button class="text-button" id="settings-demo-preview">Preview workplace with synthetic data →</button></div>`;
    document.body.append(gate);
    $("#settings-login").addEventListener("submit", event => { event.preventDefault(); $("#settings-login-message").textContent = "No authentication provider is connected. No credentials were sent or saved. Use demo access with synthetic configuration data."; });
    $("#settings-demo-preview").addEventListener("click", () => { sessionStorage.setItem("noemion.epic2.staff-demo-session", "preview"); gate.remove(); showToast("Administrator preview opened with synthetic data."); });
  }
  function persist(message = "Changes saved in this browser.") { try { localStorage.setItem(KEY, JSON.stringify(state)); $("#saved-state").textContent = message; render(); } catch { showToast("Could not save this browser configuration."); } }
  function selectLevel(value) {
    level = value;
    $$(".level-nav").forEach(button => button.classList.toggle("active", button.dataset.level === level));
    $("#level-title").textContent = level + " admissions setup";
    $("#level-subtitle").textContent = `Choose what families see when applying to ${level.toLowerCase()} school.`;
    $("#entry-description").textContent = level === "Primary" ? "Set the entry classes and day or boarding options for this pathway." : level === "Secondary" ? "Set O-level and A-level entry classes, results and boarding options." : `Set certificate or diploma courses and Day, Night, Weekend or Online options for ${level.toLowerCase()} applicants.`;
    render();
  }
  function tab(name) {
    $$(".setup-tab").forEach(button => button.classList.toggle("active", button.dataset.tab === name));
    $$(".setup-panel").forEach(panel => panel.classList.toggle("active", panel.id === "tab-" + name));
  }
  function renderItems(categoryName, targetId) {
    const items = current()[categoryName] || [];
    const html = items.map((item, index) => {
      const feeAmount = Number(String(item.amount || "").replace(/,/g, ""));
      const main = categoryName === "programmes" ? [item, "Entry option · " + level + " pathway"] : categoryName === "fields" ? [item.title, item.detail] : categoryName === "documents" ? [item, "Applicant document requirement"] : [`${item.title} · ${feeAmount > 0 ? "UGX " + feeAmount.toLocaleString("en-UG") : "Amount not entered"}`, item.date || "Add approved payment / intake information"];
      const enabledControl = categoryName === "fields" ? `<label class="toggle-control"><input type="checkbox" data-toggle-field="${index}" ${item.enabled ? "checked" : ""}> ${item.enabled ? "Shown" : "Hidden"}</label>` : "";
      return `<article class="config-row"><span class="config-row-main"><b>${esc(main[0])}</b><small>${esc(main[1] || "")}</small></span><span class="config-row-actions">${enabledControl}<button type="button" class="row-button" data-edit-item="${index}">Edit</button><button type="button" class="row-button danger-text" data-remove-item="${index}">Remove</button></span></article>`;
    }).join("");
    $("#" + targetId).innerHTML = html || '<div class="empty-config">Nothing added yet. Add an item to configure this section.</div>';
  }
  function readiness() {
    const c = current();
    const checks = [
      ["Entry programmes", c.programmes.length > 0, `${c.programmes.length} programme / class option(s)`],
      ["Applicant form fields", c.fields.some(item => item.enabled), `${c.fields.filter(item => item.enabled).length} visible field(s)`],
      ["Required documents", c.documents.length > 0, `${c.documents.length} document requirement(s)`],
      ["Fee & intake guidance", c.fees.length > 0, `${c.fees.length} fee / date item(s)`],
      ["Study services", Object.values(c.services).some(Boolean), "Study mode and support options"]
    ];
    const complete = checks.filter(item => item[1]).length;
    const pct = Math.round(complete / checks.length * 100);
    $("#readiness-number").textContent = pct + "%";
    $("#readiness-title").textContent = pct === 100 ? "Pathway setup is ready to preview" : "Complete the pathway setup";
    $("#readiness-text").textContent = pct === 100 ? `Review the ${level.toLowerCase()} applicant journey before publishing.` : "Finish each setup section before sharing this pathway with applicants.";
    $("#readiness-checks").innerHTML = checks.map(([label, ok, detail]) => `<div class="check-status ${ok ? "" : "missing"}"><b>${ok ? "✓" : "○"}</b>${esc(label)} <small>· ${esc(detail)}</small></div>`).join("");
    return checks;
  }
  function render() {
    renderItems("programmes", "programme-config");
    renderItems("fields", "field-config");
    renderItems("documents", "document-config");
    renderItems("fees", "fee-config");
    const form = $("#services-form");
    $$('[data-service-level]').forEach(option => { option.hidden = option.dataset.serviceLevel !== "all" && !option.dataset.serviceLevel.split(" ").includes(level); });
    for (const [key, value] of Object.entries(current().services)) {
      if (!form.elements[key]) continue;
      if (form.elements[key].type === "checkbox") form.elements[key].checked = Boolean(value);
      else form.elements[key].value = value;
    }
    readiness();
  }
  function showConfigDialog(kind, index = -1) {
    category = kind; editIndex = index;
    const item = index >= 0 ? current()[kind][index] : null;
    const isProgramme = kind === "programmes";
    const isField = kind === "fields";
    const isDocument = kind === "documents";
    const title = isProgramme ? "entry option" : isField ? "form field" : isDocument ? "document requirement" : "fee or intake date";
    $("#config-dialog-title").textContent = (item ? "Edit " : "Add ") + title;
    $("#config-inputs").innerHTML = isProgramme || isDocument
      ? `<label class="wide">${isProgramme ? "Programme / class name" : "Document name"} *<input name="name" required value="${esc(item || "")}" placeholder="${isProgramme ? "e.g. Senior 1 or Diploma in ICT" : "e.g. Previous school report"}"></label>`
      : isField
      ? `<label class="wide">Field label *<input name="title" required value="${esc(item?.title || "")}" placeholder="e.g. Parent / guardian telephone"></label><label>Field group<input name="group" value="${esc(item?.detail?.split(" · ")[0] || "Applicant details")}"></label><label>Requirement<select name="required"><option ${item?.detail?.includes("Required") ? "selected" : ""}>Required</option><option ${item?.detail?.includes("Optional") ? "selected" : ""}>Optional</option></select></label>`
      : `<label>Fee or date item *<input name="title" required value="${esc(item?.title || "")}" placeholder="e.g. Application fee"></label><label>Amount in UGX<input name="amount" inputmode="numeric" value="${esc(item?.amount || "")}" placeholder="Enter approved UGX amount"></label><label class="wide">Intake / payment information<input name="date" value="${esc(item?.date || "")}" placeholder="e.g. Applications close 15 Jan"></label>`;
    $("#config-form").dataset.kind = kind;
    $("#config-dialog").showModal();
  }
  function saveConfig(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const list = current()[category];
    let item;
    if (category === "programmes" || category === "documents") item = values.name.trim();
    else if (category === "fields") item = { title: values.title.trim(), detail: `${values.group || "Applicant details"} · ${values.required}`, enabled: true };
    else item = { title: values.title.trim(), amount: values.amount.trim(), date: values.date || "" };
    if (editIndex >= 0) list[editIndex] = item; else list.push(item);
    $("#config-dialog").close();
    persist((editIndex >= 0 ? "Item updated" : "Item added") + " for " + level + ".");
  }
  function removeItem(index) {
    const labels = { programmes: "entry option", fields: "form field", documents: "document requirement", fees: "fee / date item" };
    if (!confirm(`Remove this ${labels[category]} from the ${level} setup?`)) return;
    current()[category].splice(index, 1); persist("Configuration item removed.");
  }
  function preview() {
    const c = current();
    const services = Object.entries(c.services).filter(([key, value]) => value === true).map(([key]) => key);
    alert(`${level.toUpperCase()} APPLICANT REQUIREMENTS\n\nEntry options: ${c.programmes.join(", ") || "None configured"}\n\nVisible form fields: ${c.fields.filter(item => item.enabled).map(item => item.title).join(", ") || "None configured"}\n\nDocuments: ${c.documents.join(", ") || "None configured"}\n\nFees / dates: ${c.fees.map(item => `${item.title} UGX ${item.amount} · ${item.date}`).join("; ") || "None configured"}\n\nStudy services: ${services.join(", ") || "None configured"}\n\nThis is a local configuration preview. It is not published to a server.`);
  }
  function exportSetup() {
    const blob = new Blob([JSON.stringify({ level, setup: current(), exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `noemion-${level.toLowerCase()}-admissions-setup.json`; a.click(); URL.revokeObjectURL(a.href);
  }
  function activeCategory() {
    return { "tab-programmes": "programmes", "tab-form": "fields", "tab-documents": "documents", "tab-fees": "fees" }[$(".setup-panel.active").id] || "programmes";
  }
  function bind() {
    $("#level-nav").addEventListener("click", event => { const button = event.target.closest("[data-level]"); if (button) selectLevel(button.dataset.level); });
    $$(".setup-tab").forEach(button => button.addEventListener("click", () => tab(button.dataset.tab)));
    document.addEventListener("click", event => {
      const add = event.target.closest("[data-add]"); if (add) showConfigDialog(add.dataset.add);
      const edit = event.target.closest("[data-edit-item]"); if (edit) showConfigDialog(activeCategory(), Number(edit.dataset.editItem));
      const remove = event.target.closest("[data-remove-item]"); if (remove) { category = activeCategory(); removeItem(Number(remove.dataset.removeItem)); }
      const close = event.target.closest("[data-close-config]"); if (close) $("#config-dialog").close();
      const toggle = event.target.closest("[data-toggle-field]"); if (toggle) { current().fields[Number(toggle.dataset.toggleField)].enabled = toggle.checked; persist("Applicant field visibility updated."); }
    });
    $("#config-form").addEventListener("submit", saveConfig);
    $("#services-form").addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget; const services = {}; for (const field of form.elements) if (field.name) services[field.name] = field.type === "checkbox" ? field.checked : field.value.trim(); current().services = services; persist("Study services updated for " + level + "."); $("#services-saved").textContent = "Saved in this browser."; });
    $("#preview-config").addEventListener("click", preview);
    $("#recheck-setup").addEventListener("click", () => { readiness(); showToast("Setup readiness refreshed."); });
    $("#publish-config").addEventListener("click", () => { const issues = readiness().filter(item => !item[1]); if (issues.length) { alert("Complete these sections before publishing:\n\n" + issues.map(item => "• " + item[0]).join("\n")); return; } if (!confirm(`Save a local preview of ${level} admissions configuration? This will not publish it to applicants.`)) return; localStorage.setItem(KEY + ".preview." + level.toLowerCase(), JSON.stringify({ ...current(), previewedAt: new Date().toISOString() })); showToast("Local setup preview saved. Server publishing is not connected."); });
    $("#export-config").addEventListener("click", exportSetup);
    $("#settings-theme").addEventListener("change", event => { document.documentElement.dataset.theme = event.target.value; localStorage.setItem(themeKey, event.target.value); });
  }
  const savedTheme = localStorage.getItem(themeKey) || "system"; document.documentElement.dataset.theme = savedTheme; $("#settings-theme").value = savedTheme;
  bind(); render(); initStaffGate();
})();
