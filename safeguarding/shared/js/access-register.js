import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const accessRegisterList =
  document.getElementById("accessRegisterList");

const allowedRoles = [
  "super_admin",
  "safeguarding_lead"
];

async function loadAccessRegister() {
  accessRegisterList.innerHTML = "";

  const q = query(
    collection(db, "admin_users"),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    accessRegisterList.innerHTML =
      "<p>No approved users found.</p>";
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();

    const card = document.createElement("div");

    card.className =
      data.active ? "report-row" : "report-row closed-case";

    card.innerHTML = `
      <strong>👤 ${data.name || "Unnamed User"}</strong>

      <p><strong>Email:</strong> ${data.email || documentSnapshot.id}</p>
      <p><strong>Organisation:</strong> ${data.organisation || "Not provided"}</p>
      <p><strong>Requested Role:</strong> ${data.requestedRole || "Not provided"}</p>
      <p><strong>Approved Role:</strong> ${data.role || "Not set"}</p>
      <p><strong>Status:</strong> ${data.active ? "Active" : "Disabled"}</p>
      <p><strong>Created By:</strong> ${data.createdBy || "Not recorded"}</p>

      <small>User ID: ${documentSnapshot.id}</small>
    `;

    accessRegisterList.appendChild(card);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../admin/login.html";
    return;
  }

  const currentRole =
    localStorage.getItem("adminRole");

  if (!allowedRoles.includes(currentRole)) {
    alert(
      "You do not have permission to view the Access Register."
    );

    window.location.href = "index.html";
    return;
  }

  loadAccessRegister().catch((error) => {
    console.error(error);

    accessRegisterList.innerHTML =
      "<p>Error loading access register.</p>";
  });
});