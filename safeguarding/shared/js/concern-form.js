import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const concernForm = document.getElementById("concernForm");
const submitBtn = document.getElementById("submitConcernBtn");
const successMessage = document.getElementById("successMessage");

if (concernForm) {
  concernForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const data = {
      eventId: document.getElementById("eventId").value,
      reporterName: document.getElementById("reporterName").value.trim(),
      reporterRole: document.getElementById("reporterRole").value,
      phone: document.getElementById("phone").value.trim(),
      concernType: document.getElementById("concernType").value,
      location: document.getElementById("location").value.trim(),
      personConcerned: document.getElementById("personConcerned").value.trim(),
      description: document.getElementById("description").value.trim(),
      immediateRisk: document.getElementById("immediateRisk").value,
      status: "Open",
      priority: document.getElementById("immediateRisk").value === "Yes" ? "High" : "Normal",
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "safeguarding_concerns"), data);

      successMessage.style.display = "block";
      successMessage.textContent = `Concern submitted successfully. Reference: ${docRef.id}`;

      concernForm.reset();

      submitBtn.textContent = "Submitted";
    } catch (error) {
      console.error("Error submitting concern:", error);
      alert("There was an error submitting the concern. Please try again or report directly to the Safeguarding Lead.");

      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Concern";
    }
  });
}