(() => {
  "use strict";
  const base = (window.NOEMION_API_BASE || "/api").replace(/\/$/, "");
  async function request(path, options = {}) {
    let response;
    try { response = await fetch(`${base}${path}`, { credentials: "include", ...options }); }
    catch { throw new Error("Admissions service is unavailable. Please try again later."); }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "The application could not be submitted. Please review the details and try again.");
    return result;
  }
  window.NoemionApi = {
    lookupApplication: (reference, phone) => request("/admissions/applications/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, phone }) }),
    askAdmissionsAssistant: (message, level) => request("/admissions/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, level }) }),
    submitApplication: (payload, files, medicalReports = []) => {
      const body = new FormData();
      body.append("application", JSON.stringify(payload));
      for (const file of files) body.append("documents", file, file.name);
      for (const file of medicalReports) body.append("medicalReports", file, file.name);
      return request("/admissions/applications", { method: "POST", body });
    }
  };
})();
