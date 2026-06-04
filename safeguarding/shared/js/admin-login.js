import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");
const googleBtn = document.getElementById("googleLoginBtn");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
      document.getElementById("email").value.trim().toLowerCase();

    const password =
      document.getElementById("password").value;

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      if (error.code === "auth/user-not-found") {

        loginMessage.textContent =
          "No account found for this email address.";
      
      } else if (error.code === "auth/wrong-password") {
      
        loginMessage.textContent =
          "Incorrect password.";
      
      } else if (error.code === "auth/invalid-credential") {
      
        loginMessage.textContent =
          "Incorrect email or password.";
      
      } else if (error.code === "auth/invalid-email") {
      
        loginMessage.textContent =
          "Invalid email address.";
      
      } else if (error.code === "auth/too-many-requests") {
      
        loginMessage.textContent =
          "Too many login attempts. Please try again later.";
      
      } else {
      
        loginMessage.textContent =
          "Login failed. Please try again.";
      
      }

    }

  });

}

if (googleBtn) {

  googleBtn.addEventListener("click", async () => {

    try {

      const provider =
        new GoogleAuthProvider();

      await signInWithPopup(
        auth,
        provider
      );

      window.location.href =
        "index.html";

    } catch (error) {

      console.error(error);

      if (error.code === "auth/popup-closed-by-user") {

        loginMessage.textContent =
          "Google sign in was cancelled.";
      
      } else if (error.code === "auth/popup-blocked") {
      
        loginMessage.textContent =
          "Your browser blocked the Google sign in popup.";
      
      } else {
      
        loginMessage.textContent =
          "Google sign in failed. Please try again.";
      
      }

    }

  });

}