import { db } from "./firebase-config.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const form = document.getElementById("addAdminUserForm");
const userMessage = document.getElementById("userMessage");
const usersList = document.getElementById("adminUsersList");
const pendingRequestsList = document.getElementById("pendingRequestsList");
const userInfo = document.getElementById("adminUserInfo");

const currentRole = localStorage.getItem("adminRole");
const currentName = localStorage.getItem("adminName");
const currentEmail = localStorage.getItem("adminEmail");

if (userInfo) {
  userInfo.innerHTML = `
    👤 ${currentName || "Admin"} | ${currentRole || "role unknown"}
  `;
}

function requireSuperAdmin() {
  if (currentRole !== "super_admin") {
    alert("Access denied. Only Super Admin can manage users.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

async function loadUsers() {
  usersList.innerHTML = "";

  const q = query(
    collection(db, "admin_users"),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    usersList.innerHTML = "<p>No admin users found.</p>";
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

      <p><strong>Role:</strong> ${data.role || "Not set"}</p>

      <p><strong>Status:</strong> ${
        data.active ? "Active" : "Disabled"
      }</p>

      <div class="status-actions">
        <button data-email="${documentSnapshot.id}" data-active="true">
          Enable
        </button>

        <button data-email="${documentSnapshot.id}" data-active="false">
          Disable
        </button>
      </div>
    `;

    usersList.appendChild(card);
  });
}

async function loadPendingRequests() {
  if (!pendingRequestsList) return;

  pendingRequestsList.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "pending_admin_requests")
  );

  if (snapshot.empty) {
    pendingRequestsList.innerHTML =
      "<p>No pending requests.</p>";
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();

    const card = document.createElement("div");
    card.className = "report-row";

    card.innerHTML = `
      <strong>🟡 ${data.name || "Unknown User"}</strong>

      <p><strong>Email:</strong> ${data.email}</p>

      <div class="status-actions">

        <button
          class="approve-user"
          data-email="${data.email}"
          data-role="safeguarding_lead">
          Approve Lead
        </button>

        <button
          class="approve-user"
          data-email="${data.email}"
          data-role="deputy_safeguarding_lead">
          Approve Deputy
        </button>

        <button
          class="approve-user"
          data-email="${data.email}"
          data-role="organiser">
          Approve Organiser
        </button>

        <button
          class="reject-user"
          data-email="${data.email}">
          Reject
        </button>

      </div>
    `;

    pendingRequestsList.appendChild(card);
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!requireSuperAdmin()) return;

    const name =
      document.getElementById("adminName").value.trim();

    const email =
      document.getElementById("adminEmail")
        .value.trim()
        .toLowerCase();

    const role =
      document.getElementById("adminRole").value;

    if (!name || !email || !role) {
      userMessage.textContent =
        "Please complete all fields.";
      return;
    }

    await setDoc(doc(db, "admin_users", email), {
      name,
      email,
      role,
      active: true,
      createdBy: currentEmail || "unknown",
      createdAt: serverTimestamp()
    });

    userMessage.textContent =
      "User added successfully.";

    form.reset();

    await loadUsers();
  });
}

document.addEventListener("click", async (e) => {

  if (e.target.matches(".approve-user")) {

    const email = e.target.dataset.email;
    const role = e.target.dataset.role;

    await setDoc(
      doc(db, "admin_users", email),
      {
        name: email,
        email,
        role,
        active: true,
        createdBy: currentEmail,
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

    await deleteDoc(
      doc(db, "pending_admin_requests", email)
    );

    await loadPendingRequests();
    await loadUsers();

    alert("User approved.");
    return;
  }

  if (e.target.matches(".reject-user")) {

    const email = e.target.dataset.email;

    await deleteDoc(
      doc(db, "pending_admin_requests", email)
    );

    await loadPendingRequests();

    alert("Request rejected.");
    return;
  }

  if (!e.target.matches(".status-actions button")) return;

  if (!requireSuperAdmin()) return;

  const email = e.target.dataset.email;
  const active = e.target.dataset.active === "true";

  await updateDoc(
    doc(db, "admin_users", email),
    {
      active,
      updatedBy: currentEmail || "unknown",
      updatedAt: serverTimestamp()
    }
  );

  await loadUsers();
});

if (requireSuperAdmin()) {
  loadUsers().catch((error) => {
    console.error("Error loading users:", error);
    usersList.innerHTML =
      "<p>Error loading admin users.</p>";
  });

  loadPendingRequests().catch((error) => {
    console.error("Error loading requests:", error);

    if (pendingRequestsList) {
      pendingRequestsList.innerHTML =
        "<p>Error loading pending requests.</p>";
    }
  });
}