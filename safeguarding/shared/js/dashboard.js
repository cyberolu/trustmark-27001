import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const eventId = "ndtc2026";

/* =========================
   COUNT RECORDS
========================= */

async function getCount(collectionName, status = null) {
  let q;

  if (status) {
    q = query(
      collection(db, collectionName),
      where("eventId", "==", eventId),
      where("status", "==", status)
    );
  } else {
    q = query(
      collection(db, collectionName),
      where("eventId", "==", eventId)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.size;
}

const userInfo =
  document.getElementById("adminUserInfo");

if (userInfo) {

  userInfo.innerHTML = `
    Logged in as:
    <strong>${localStorage.getItem("adminName")}</strong>
    (${localStorage.getItem("adminRole")})
  `;
}
/* =========================
   DASHBOARD COUNTS
========================= */

async function loadDashboardCounts() {

  const openConcerns =
    (await getCount("safeguarding_concerns", "Open")) +
    (await getCount("safeguarding_concerns", "In Progress"));

  const openIncidents =
    (await getCount("incident_reports", "Open")) +
    (await getCount("incident_reports", "In Progress"));

  const openMissing =
    (await getCount("missing_child_alerts", "Open")) +
    (await getCount("missing_child_alerts", "In Progress"));

  const closedConcerns =
    await getCount("safeguarding_concerns", "Closed");

  const closedIncidents =
    await getCount("incident_reports", "Closed");

  const closedMissing =
    await getCount("missing_child_alerts", "Closed");

  document.getElementById("openConcerns").textContent =
    openConcerns;

  document.getElementById("openIncidents").textContent =
    openIncidents;

  document.getElementById("missingAlerts").textContent =
    openMissing;

  document.getElementById("closedCases").textContent =
    closedConcerns +
    closedIncidents +
    closedMissing;
}

/* =========================
   RECENT REPORTS
========================= */

async function loadRecentReports() {

  const recentList =
    document.getElementById("recentReports");

  if (!recentList) return;

  recentList.innerHTML = "";

  const collections = [
    {
      name: "safeguarding_concerns",
      label: "Concern",
      icon: "🟡"
    },
    {
      name: "incident_reports",
      label: "Incident",
      icon: "🔴"
    },
    {
      name: "missing_child_alerts",
      label: "Missing Child",
      icon: "🚨"
    }
  ];

  for (const item of collections) {

    const q = query(
      collection(db, item.name),
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {

      const data = doc.data();

      const card =
        document.createElement("div");

      card.className = "report-row";

      const title =
        data.concernType ||
        data.incidentType ||
        data.childName ||
        "Report";

      const reporter =
        data.reporterName ||
        "Unknown Reporter";

      const status =
        data.status ||
        "Open";

      card.innerHTML = `
        <strong>${item.icon} ${item.label}: ${title}</strong>
        <p>${reporter} | Status: ${status}</p>
        <small>Reference: ${doc.id}</small>
      `;

      recentList.appendChild(card);

    });
  }
}

/* =========================
   INITIALISE DASHBOARD
========================= */

async function initDashboard() {

  try {

    await loadDashboardCounts();

    await loadRecentReports();

    console.log("Dashboard connected");

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );
  }
}

initDashboard();