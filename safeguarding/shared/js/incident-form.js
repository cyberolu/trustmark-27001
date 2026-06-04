import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const incidentForm = document.getElementById("incidentForm");
const submitBtn = document.getElementById("submitIncidentBtn");
const successMessage = document.getElementById("successMessage");

if (incidentForm) {
  incidentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const data = {
      eventId: document.getElementById("eventId").value,

      reporterName: document.getElementById("reporterName").value.trim(),
      reporterRole: document.getElementById("reporterRole").value,
      phone: document.getElementById("phone").value.trim(),

      incidentType: document.getElementById("incidentType").value,
      location: document.getElementById("location").value.trim(),
      personsInvolved: document.getElementById("personsInvolved").value.trim(),

      incidentDate: document.getElementById("incidentDate").value,
      incidentTime: document.getElementById("incidentTime").value,

      description: document.getElementById("description").value.trim(),
      actionTaken: document.getElementById("actionTaken").value.trim(),

      severity: document.getElementById("severity").value,
      immediateEmergency: document.getElementById("immediateEmergency").value,

      status: "Open",

      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(
        collection(db, "incident_reports"),
        data
      );

      successMessage.style.display = "block";
      successMessage.textContent =
        `Incident submitted successfully. Reference: ${docRef.id}`;

      incidentForm.reset();

      submitBtn.textContent = "Submitted";

    } catch (error) {
      console.error(error);

      alert(
        "There was an error submitting the incident report. Please try again."
      );

      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Incident Report";
    }
  });
}