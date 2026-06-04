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
      document.getElementById("email").value.trim();

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

      loginMessage.textContent =
        "Login failed.";

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

      loginMessage.textContent =
        "Google login failed.";

    }

  });

}