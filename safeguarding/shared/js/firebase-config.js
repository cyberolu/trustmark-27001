import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCv52q0zDbn3sPNeqnMV6ewmc9rzaEXQPU",
    authDomain: "trustmark-safeguarding.firebaseapp.com",
    projectId: "trustmark-safeguarding",
    storageBucket: "trustmark-safeguarding.firebasestorage.app",
    messagingSenderId: "119605640827",
    appId: "1:119605640827:web:7ff87d34edb26683ff2cde",
    measurementId: "G-LW7B7CNGSZ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);