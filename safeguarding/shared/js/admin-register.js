import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const organisation = document.getElementById("organisation").value.trim();
    const requestedRole = document.getElementById("requestedRole").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      registerMessage.textContent = "Passwords do not match.";
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(
        doc(db, "pending_admin_requests", email),
        {
          name: fullName,
          email,
          organisation,
          requestedRole,
          status: "pending",
          requestedAt: serverTimestamp()
        },
        { merge: true }
      );

      registerMessage.textContent =
        "Account created. Your access request is pending Super Admin approval.";

      await signOut(auth);

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2500);

    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        registerMessage.textContent =
          "This email already has an account. Please login instead.";
        return;
      }

      registerMessage.textContent =
        "Unable to create account. Please try again.";
    }
  });
}