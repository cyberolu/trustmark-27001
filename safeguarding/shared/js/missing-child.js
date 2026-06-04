import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const missingChildForm = document.getElementById("missingChildForm");
const submitBtn = document.getElementById("submitMissingChildBtn");
const successMessage = document.getElementById("successMessage");

if (missingChildForm) {
  missingChildForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Alert...";

    const data = {
      eventId: document.getElementById("eventId").value,

      reporterName: document.getElementById("reporterName").value.trim(),
      phone: document.getElementById("phone").value.trim(),

      childName: document.getElementById("childName").value.trim(),
      childAge: document.getElementById("childAge").value,
      gender: document.getElementById("gender").value,

      clothing: document.getElementById("clothing").value.trim(),
      features: document.getElementById("features").value.trim(),

      lastSeenLocation: document.getElementById("lastSeenLocation").value.trim(),
      lastSeenTime: document.getElementById("lastSeenTime").value,

      responsibleAdult: document.getElementById("responsibleAdult").value.trim(),
      adultContact: document.getElementById("adultContact").value.trim(),

      medicalRisk: document.getElementById("medicalRisk").value,
      additionalInfo: document.getElementById("additionalInfo").value.trim(),

      status: "Open",
      priority: "Critical",
      alertType: "Missing Child",
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(
        collection(db, "missing_child_alerts"),
        data
      );

      successMessage.style.display = "block";
      successMessage.textContent =
        `Missing child alert submitted successfully. Reference: ${docRef.id}`;

      missingChildForm.reset();

      submitBtn.textContent = "Alert Submitted";

    } catch (error) {
      console.error(error);

      alert(
        "There was an error submitting the missing child alert. Report verbally to the Safeguarding Lead or Command Centre immediately."
      );

      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Missing Child Alert";
    }
  });
}