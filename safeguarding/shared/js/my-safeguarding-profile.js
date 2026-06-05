import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const allowedRoles = [
  "super_admin",
  "safeguarding_lead",
  "deputy_safeguarding_lead",
  "safeguarding_team"
];

const form = document.getElementById("mySafeguardingProfileForm");
const profileMessage = document.getElementById("profileMessage");
const profileStatus = document.getElementById("profileStatus");

function fillForm(data) {
  document.getElementById("profileName").value = data.name || "";
  document.getElementById("profileEmail").value = data.email || "";
  document.getElementById("profilePhone").value = data.phone || "";
  document.getElementById("profileOrganisation").value = data.organisation || "";
  document.getElementById("profileSafeguardingRole").value = data.safeguardingRole || "";
  document.getElementById("profileTrainingCompleted").value = data.trainingCompleted || "";
  document.getElementById("profileTrainingProvider").value = data.trainingProvider || "";
  document.getElementById("profileTrainingExpiry").value = data.trainingExpiry || "";
  document.getElementById("profileOuSafeguardingCompleted").value = data.ouSafeguardingCompleted || "";
  document.getElementById("profileOuSafeguardingDate").value = data.ouSafeguardingDate || "";
  document.getElementById("profileOuSafeguardingBadge").value = data.ouSafeguardingBadge || "";
  document.getElementById("profileDbsStatus").value = data.dbsStatus || "";
  document.getElementById("profileDbsExpiry").value = data.dbsExpiry || "";
  document.getElementById("profileFirstAid").value = data.firstAidTrained || "";
  document.getElementById("profileAvailability").value = data.availability || "";
  document.getElementById("profileResponsibilities").value = data.responsibilities || "";
  document.getElementById("profileNotes").value = data.notes || "";

  profileStatus.textContent =
    `Profile status: ${data.status || "Submitted"}`;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const email = user.email.toLowerCase();

  const adminDoc = await getDoc(
    doc(db, "admin_users", email)
  );

  if (!adminDoc.exists()) {
    alert("You are not authorised to complete a safeguarding profile.");
    window.location.href = "../../admin/login.html";
    return;
  }

  const adminData = adminDoc.data();
  const role = adminData.role;

  if (!allowedRoles.includes(role)) {
    alert("This profile page is only for safeguarding personnel.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("profileEmail").value = email;

  if (adminData.name) {
    document.getElementById("profileName").value = adminData.name;
  }

  const profileRef = doc(db, "safeguarding_profiles", email);
  const profileDoc = await getDoc(profileRef);

  if (profileDoc.exists()) {
    fillForm(profileDoc.data());
  } else {
    profileStatus.textContent =
      "Profile status: Not submitted yet.";
  }
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email =
      document.getElementById("profileEmail").value.trim().toLowerCase();

    await setDoc(
      doc(db, "safeguarding_profiles", email),
      {
        name: document.getElementById("profileName").value.trim(),
        email,
        phone: document.getElementById("profilePhone").value.trim(),
        organisation: document.getElementById("profileOrganisation").value,
        safeguardingRole: document.getElementById("profileSafeguardingRole").value,
        trainingCompleted: document.getElementById("profileTrainingCompleted").value,
        trainingProvider: document.getElementById("profileTrainingProvider").value.trim(),
        trainingExpiry: document.getElementById("profileTrainingExpiry").value,
        ouSafeguardingCompleted: document.getElementById("profileOuSafeguardingCompleted").value,
        ouSafeguardingDate: document.getElementById("profileOuSafeguardingDate").value,
        ouSafeguardingBadge: document.getElementById("profileOuSafeguardingBadge").value,
        dbsStatus: document.getElementById("profileDbsStatus").value,
        dbsExpiry: document.getElementById("profileDbsExpiry").value,
        firstAidTrained: document.getElementById("profileFirstAid").value,
        availability: document.getElementById("profileAvailability").value.trim(),
        responsibilities: document.getElementById("profileResponsibilities").value.trim(),
        notes: document.getElementById("profileNotes").value.trim(),
        status: "Submitted",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    profileMessage.style.color = "green";
    profileMessage.textContent =
      "Your safeguarding profile has been submitted for review.";

    profileStatus.textContent =
      "Profile status: Submitted";
  });
}