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
const alertsList = document.getElementById("missingChildrenList");

function userCanCloseCase() {
  const role = localStorage.getItem("adminRole");

  return (
    role === "super_admin" ||
    role === "safeguarding_lead" ||
    role === "deputy_safeguarding_lead"
  );
}

async function loadAlerts() {
  alertsList.innerHTML = "";

  const q = query(
    collection(db, "missing_child_alerts"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    alertsList.innerHTML = "<p>No missing child alerts found.</p>";
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();
    const canClose = userCanCloseCase();

    const card = document.createElement("div");
    card.className =
      data.status === "Closed" ? "report-row closed-case" : "report-row";

    card.innerHTML = `
      <strong>🚨 ${data.childName || "Unknown Child"}</strong>

      <p><strong>Age:</strong> ${data.childAge || "Unknown"}</p>
      <p><strong>Gender:</strong> ${data.gender || "Unknown"}</p>
      <p><strong>Last Seen:</strong> ${data.lastSeenLocation || "Unknown"}</p>
      <p><strong>Time:</strong> ${data.lastSeenTime || "Unknown"}</p>
      <p><strong>Medical Risk:</strong> ${data.medicalRisk || "Unknown"}</p>
      <p><strong>Responsible Adult:</strong> ${data.responsibleAdult || "Unknown"}</p>
      <p><strong>Contact:</strong> ${data.adultContact || "Unknown"}</p>
      <p><strong>Status:</strong> ${data.status || "Open"}</p>
      <p><strong>Priority:</strong> ${data.priority || "Critical"}</p>

      <small>Reference: ${documentSnapshot.id}</small>

      ${
        data.status === "Closed"
          ? `
            <div class="closed-summary">
              <p><strong>Actions Taken:</strong> ${data.actionsTaken || "Not recorded"}</p>
              <p><strong>Outcome:</strong> ${data.outcomeSummary || "Not recorded"}</p>
              <p><strong>Child Found:</strong> ${data.childFound || "Not recorded"}</p>
              <p><strong>Reunited With Adult:</strong> ${data.reunitedWithAdult || "Not recorded"}</p>
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

    alertsList.appendChild(card);
  });
}

document.addEventListener("click", async (e) => {
  if (!e.target.matches(".status-actions button")) return;

  const id = e.target.dataset.id;
  const status = e.target.dataset.status;

  if (status === "Closed") {
    if (!userCanCloseCase()) {
      alert("You do not have permission to close missing child alerts.");
      return;
    }

    const actionsTaken = prompt("What actions were taken?");
    if (!actionsTaken) {
      alert("You must record actions taken before closing this alert.");
      return;
    }

    const outcomeSummary = prompt("What was the outcome?");
    if (!outcomeSummary) {
      alert("You must record the outcome before closing this alert.");
      return;
    }

    const childFound = prompt("Was the child found? Yes or No");
    if (!childFound) {
      alert("You must record whether the child was found.");
      return;
    }

    const reunitedWithAdult = prompt(
      "Was the child reunited with parent, guardian or responsible adult? Yes or No"
    );
    if (!reunitedWithAdult) {
      alert("You must record whether the child was reunited with an adult.");
      return;
    }

    const closedBy = prompt("Closed by?");
    if (!closedBy) {
      alert("You must record who closed the alert.");
      return;
    }

    await updateDoc(doc(db, "missing_child_alerts", id), {
      status: "Closed",
      actionsTaken: actionsTaken,
      outcomeSummary: outcomeSummary,
      childFound: childFound,
      reunitedWithAdult: reunitedWithAdult,
      closedBy: closedBy,
      closedAt: new Date().toISOString()
    });

    loadAlerts();
    return;
  }

  await updateDoc(doc(db, "missing_child_alerts", id), {
    status: status
  });

  loadAlerts();
});

loadAlerts().catch((error) => {
  console.error("Error loading missing child alerts:", error);
  alertsList.innerHTML = "<p>Error loading missing child alerts.</p>";
});