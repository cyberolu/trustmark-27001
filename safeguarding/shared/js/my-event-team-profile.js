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

const form = document.getElementById("myEventTeamProfileForm");
const eventProfileMessage = document.getElementById("eventProfileMessage");
const eventProfileStatus = document.getElementById("eventProfileStatus");

function fillForm(data) {
  document.getElementById("eventName").value = data.name || "";
  document.getElementById("eventEmail").value = data.email || "";
  document.getElementById("eventPhone").value = data.phone || "";
  document.getElementById("eventOrganisation").value = data.organisation || "";
  document.getElementById("eventRole").value = data.eventRole || "";
  document.getElementById("eventDays").value = data.eventDays || "";
  document.getElementById("eventResponsibilities").value = data.responsibilities || "";
  document.getElementById("eventSafeguardingBriefing").value = data.safeguardingBriefing || "";
  document.getElementById("eventOuSafeguardingCompleted").value = data.ouSafeguardingCompleted || "";
  document.getElementById("eventOuSafeguardingDate").value = data.ouSafeguardingDate || "";
  document.getElementById("eventOuSafeguardingBadge").value = data.ouSafeguardingBadge || "";
  document.getElementById("eventEmergencyContact").value = data.emergencyContactAvailable || "";
  document.getElementById("eventNotes").value = data.notes || "";

  eventProfileStatus.textContent =
    `Profile status: ${data.status || "Submitted"}`;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const email = user.email.toLowerCase();

  const adminDoc = await getDoc(
    doc(db, "admin_users", email)
  );

  if (!adminDoc.exists()) {
    alert("You are not authorised to complete an event team profile.");
    window.location.href = "../../admin/login.html";
    return;
  }

  const adminData = adminDoc.data();

  document.getElementById("eventEmail").value = email;

  if (adminData.name) {
    document.getElementById("eventName").value = adminData.name;
  }

  const profileRef = doc(db, "event_team_profiles", email);
  const profileDoc = await getDoc(profileRef);

  if (profileDoc.exists()) {
    fillForm(profileDoc.data());
  } else {
    eventProfileStatus.textContent =
      "Profile status: Not submitted yet.";
  }
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email =
      document.getElementById("eventEmail")
        .value.trim()
        .toLowerCase();

    await setDoc(
      doc(db, "event_team_profiles", email),
      {
        name: document.getElementById("eventName").value.trim(),
        email,
        phone: document.getElementById("eventPhone").value.trim(),
        organisation: document.getElementById("eventOrganisation").value,
        eventRole: document.getElementById("eventRole").value,
        eventDays: document.getElementById("eventDays").value.trim(),
        responsibilities: document.getElementById("eventResponsibilities").value.trim(),
        safeguardingBriefing: document.getElementById("eventSafeguardingBriefing").value,
        ouSafeguardingCompleted: document.getElementById("eventOuSafeguardingCompleted").value,
        ouSafeguardingDate: document.getElementById("eventOuSafeguardingDate").value,
        ouSafeguardingBadge: document.getElementById("eventOuSafeguardingBadge").value,
        emergencyContactAvailable: document.getElementById("eventEmergencyContact").value,
        notes: document.getElementById("eventNotes").value.trim(),
        status: "Submitted",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    eventProfileMessage.style.color = "green";
    eventProfileMessage.textContent =
      "Your event team profile has been submitted for review.";

    eventProfileStatus.textContent =
      "Profile status: Submitted";
  });
}