import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const eventId = "ndtc2026";
const incidentsList = document.getElementById("incidentsList");

function userCanCloseCase() {
  const role = localStorage.getItem("adminRole");

  return (
    role === "super_admin" ||
    role === "safeguarding_lead" ||
    role === "deputy_safeguarding_lead"
  );
}

async function loadIncidents() {
  incidentsList.innerHTML = "";

  const q = query(
    collection(db, "incident_reports"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    incidentsList.innerHTML = "<p>No incident reports found.</p>";
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();
    const canClose = userCanCloseCase();

    const card = document.createElement("div");
    card.className =
      data.status === "Closed" ? "report-row closed-case" : "report-row";

    card.innerHTML = `
      <strong>🔴 ${data.incidentType || "Incident"}</strong>

      <p><strong>Reporter:</strong> ${data.reporterName || "Not provided"}</p>
      <p><strong>Role:</strong> ${data.reporterRole || "Not provided"}</p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <p><strong>Location:</strong> ${data.location || "Not provided"}</p>
      <p><strong>Person(s) Involved:</strong> ${data.personsInvolved || "Not provided"}</p>
      <p><strong>Date:</strong> ${data.incidentDate || "Not provided"}</p>
      <p><strong>Time:</strong> ${data.incidentTime || "Not provided"}</p>
      <p><strong>Severity:</strong> ${data.severity || "Not provided"}</p>
      <p><strong>Immediate Emergency:</strong> ${data.immediateEmergency || "Not provided"}</p>
      <p><strong>Status:</strong> ${data.status || "Open"}</p>
      <p><strong>Description:</strong> ${data.description || "No description"}</p>
      <p><strong>Action Taken:</strong> ${data.actionTaken || "No action recorded"}</p>

      <small>Reference: ${documentSnapshot.id}</small>

      ${
        data.status === "Closed"
          ? `
            <div class="closed-summary">
              <p><strong>Actions Taken:</strong> ${data.actionsTaken || "Not recorded"}</p>
              <p><strong>Outcome:</strong> ${data.outcomeSummary || "Not recorded"}</p>
              <p><strong>Closed By:</strong> ${data.closedBy || "Not recorded"}</p>
              <p><strong>Closed At:</strong> ${data.closedAt || "Not recorded"}</p>
            </div>
          `
          : `
            <div class="status-actions">
              <button data-id="${documentSnapshot.id}" data-status="Open">Open</button>
              <button data-id="${documentSnapshot.id}" data-status="In Progress">In Progress</button>

              ${
                canClose
                  ? `
                    <button
                      data-id="${documentSnapshot.id}"
                      data-status="Closed"
                      class="close-case-btn">
                      Close Case
                    </button>
                  `
                  : ""
              }
            </div>
          `
      }
    `;

    incidentsList.appendChild(card);
  });
}

document.addEventListener("click", async (e) => {
  if (!e.target.matches(".status-actions button")) return;

  const id = e.target.dataset.id;
  const status = e.target.dataset.status;

  if (status === "Closed") {
    if (!userCanCloseCase()) {
      alert("You do not have permission to close incident reports.");
      return;
    }

    const actionsTaken = prompt("What actions were taken?");
    if (!actionsTaken) {
      alert("You must record actions taken before closing this incident.");
      return;
    }

    const outcomeSummary = prompt("What was the outcome?");
    if (!outcomeSummary) {
      alert("You must record the outcome before closing this incident.");
      return;
    }

    const closedBy = prompt("Closed by?");
    if (!closedBy) {
      alert("You must record who closed the incident.");
      return;
    }

    await updateDoc(doc(db, "incident_reports", id), {
      status: "Closed",
      actionsTaken: actionsTaken,
      outcomeSummary: outcomeSummary,
      closedBy: closedBy,
      closedAt: new Date().toISOString()
    });

    loadIncidents();
    return;
  }

  await updateDoc(doc(db, "incident_reports", id), {
    status: status
  });

  loadIncidents();
});

loadIncidents().catch((error) => {
  console.error("Error loading incidents:", error);
  incidentsList.innerHTML = "<p>Error loading incident reports.</p>";
});