import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const eventTeamList =
  document.getElementById("eventTeamList");

const allowedViewRoles = [
  "super_admin",
  "safeguarding_lead",
  "deputy_safeguarding_lead",
  "organiser"
];

const allowedReviewRoles = [
  "super_admin",
  "organiser"
];

function canReview(role) {
  return allowedReviewRoles.includes(role);
}

async function loadEventTeamRegister(currentRole) {
  eventTeamList.innerHTML = "";

  const q = query(
    collection(db, "event_team_profiles"),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    eventTeamList.innerHTML =
      "<p>No event team profiles submitted yet.</p>";
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();

    const card = document.createElement("div");

    card.className =
      data.status === "Inactive"
        ? "report-row closed-case"
        : "report-row";

    card.innerHTML = `
      <strong>👤 ${data.name || "Unknown"}</strong>

      <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <p><strong>Organisation:</strong> ${data.organisation || "Not provided"}</p>
      <p><strong>Role at Event:</strong> ${data.eventRole || "Not provided"}</p>
      <p><strong>Event Days:</strong> ${data.eventDays || "Not provided"}</p>
      <p><strong>Responsibilities:</strong> ${data.responsibilities || "Not provided"}</p>

      <p><strong>Safeguarding Briefing:</strong> ${data.safeguardingBriefing || "Not provided"}</p>
      <p><strong>OU Safeguarding Essentials:</strong> ${data.ouSafeguardingCompleted || "Not provided"}</p>
      <p><strong>OU Completion Date:</strong> ${data.ouSafeguardingDate || "Not provided"}</p>
      <p><strong>OU Badge Verified:</strong> ${data.ouSafeguardingBadge || "Not provided"}</p>

      <p><strong>Emergency Contact Available:</strong> ${data.emergencyContactAvailable || "Not provided"}</p>
      <p><strong>Notes:</strong> ${data.notes || "None"}</p>
      <p><strong>Status:</strong> ${data.status || "Submitted"}</p>

      <small>Profile ID: ${documentSnapshot.id}</small>

      ${
        canReview(currentRole)
          ? `
            <div class="status-actions">
              <button data-id="${documentSnapshot.id}" data-status="Approved">
                Approve
              </button>

              <button data-id="${documentSnapshot.id}" data-status="Needs Update">
                Needs Update
              </button>

              <button data-id="${documentSnapshot.id}" data-status="Inactive">
                Mark Inactive
              </button>
            </div>
          `
          : ""
      }
    `;

    eventTeamList.appendChild(card);
  });
}

document.addEventListener("click", async (e) => {
  if (!e.target.matches(".status-actions button")) return;

  const currentRole =
    localStorage.getItem("adminRole");

  if (!canReview(currentRole)) {
    alert("You do not have permission to review event team profiles.");
    return;
  }

  const id = e.target.dataset.id;
  const status = e.target.dataset.status;

  await updateDoc(
    doc(db, "event_team_profiles", id),
    {
      status,
      reviewedAt: new Date().toISOString()
    }
  );

  await loadEventTeamRegister(currentRole);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../admin/login.html";
    return;
  }

  const currentRole =
    localStorage.getItem("adminRole");

  if (!allowedViewRoles.includes(currentRole)) {
    alert(
      "You do not have permission to view the event team register."
    );

    window.location.href = "index.html";
    return;
  }

  loadEventTeamRegister(currentRole).catch((error) => {
    console.error(error);

    eventTeamList.innerHTML =
      "<p>Error loading event team register.</p>";
  });
});