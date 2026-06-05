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

      registerMessage.style.color = "green";

      registerMessage.textContent =
        "Thank you for registering. Your account has been created successfully and your access request has been submitted for approval. A Super Admin must approve your account before you can access the safeguarding dashboard.";

      alert(
        "Registration successful. Your account is awaiting approval from a Super Admin. You will be able to access the safeguarding dashboard once your request has been approved."
      );

      await signOut(auth);

      setTimeout(() => {
        window.location.href = "login.html";
      },5000);

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