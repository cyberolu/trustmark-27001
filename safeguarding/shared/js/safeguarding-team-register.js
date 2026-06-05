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

const registerContainer =
  document.getElementById("safeguardingTeamList");

const allowedRoles = [
  "super_admin",
  "safeguarding_lead",
  "deputy_safeguarding_lead"
];

async function loadRegister() {
  registerContainer.innerHTML = "";

  const q = query(
    collection(db, "safeguarding_profiles"),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    registerContainer.innerHTML =
      "<p>No safeguarding profiles submitted yet.</p>";
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
      <p><strong>Safeguarding Role:</strong> ${data.safeguardingRole || "Not provided"}</p>

      <p><strong>General Safeguarding Training:</strong> ${data.trainingCompleted || "Not provided"}</p>
      <p><strong>Training Provider:</strong> ${data.trainingProvider || "Not provided"}</p>
      <p><strong>Training Expiry:</strong> ${data.trainingExpiry || "Not provided"}</p>

      <p><strong>OU Safeguarding Essentials:</strong> ${data.ouSafeguardingCompleted || "Not provided"}</p>
      <p><strong>OU Completion Date:</strong> ${data.ouSafeguardingDate || "Not provided"}</p>
      <p><strong>OU Badge Verified:</strong> ${data.ouSafeguardingBadge || "Not provided"}</p>

      <p><strong>DBS Status:</strong> ${data.dbsStatus || "Not provided"}</p>
      <p><strong>DBS Expiry:</strong> ${data.dbsExpiry || "Not provided"}</p>
      <p><strong>First Aid:</strong> ${data.firstAidTrained || "Not provided"}</p>
      <p><strong>Availability:</strong> ${data.availability || "Not provided"}</p>
      <p><strong>Responsibilities:</strong> ${data.responsibilities || "Not provided"}</p>
      <p><strong>Notes:</strong> ${data.notes || "None"}</p>
      <p><strong>Status:</strong> ${data.status || "Submitted"}</p>

      <small>Profile ID: ${documentSnapshot.id}</small>

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
    `;

    registerContainer.appendChild(card);
  });
}

document.addEventListener("click", async (e) => {
  if (!e.target.matches(".status-actions button")) return;

  const id = e.target.dataset.id;
  const status = e.target.dataset.status;

  await updateDoc(
    doc(db, "safeguarding_profiles", id),
    {
      status,
      reviewedAt: new Date().toISOString()
    }
  );

  await loadRegister();
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../admin/login.html";
    return;
  }

  const role = localStorage.getItem("adminRole");

  if (!allowedRoles.includes(role)) {
    alert(
      "You do not have permission to view the safeguarding team register."
    );

    window.location.href = "index.html";
    return;
  }

  loadRegister().catch((error) => {
    console.error(error);

    registerContainer.innerHTML =
      "<p>Error loading safeguarding register.</p>";
  });
});