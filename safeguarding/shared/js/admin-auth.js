import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const email = user.email.toLowerCase();

    const adminRef = doc(db, "admin_users", email);
    const adminDoc = await getDoc(adminRef);

    if (!adminDoc.exists()) {
      const pendingRef = doc(db, "pending_admin_requests", email);

      await setDoc(pendingRef, {
        email: email,
        name: user.displayName || "Unknown user",
        status: "pending",
        requestedAt: serverTimestamp()
      }, { merge: true });

      alert(
        "Your access request has been submitted. A Super Admin must approve your account before you can access the dashboard."
      );

      await signOut(auth);
      window.location.href = "./login.html";
      return;
    }

    const adminData = adminDoc.data();

    if (!adminData.active) {
      alert("Your safeguarding account has been disabled.");

      await signOut(auth);
      window.location.href = "./login.html";
      return;
    }

    localStorage.setItem("adminRole", adminData.role);
    localStorage.setItem("adminName", adminData.name);
    localStorage.setItem("adminEmail", adminData.email);

    console.log("Authorised admin:", adminData.name, adminData.role);

  } catch (error) {
    console.error("Admin validation failed:", error);

    await signOut(auth);
    window.location.href = "./login.html";
  }
});