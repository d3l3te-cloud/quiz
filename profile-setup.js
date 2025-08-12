// profile-setup.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your Firebase Config (same as before)
const firebaseConfig = {
  apiKey: "AIzaSyAfTmjToH6C0Xje5zVI2ZlDFgMuz92nUXs",
  authDomain: "quizzo1-e5157.firebaseapp.com",
  projectId: "quizzo1-e5157",
  storageBucket: "quizzo1-e5157.firebasestorage.app",
  messagingSenderId: "1003232389896",
  appId: "1:1003232389896:web:9abf8f2a9f92dd94b5dabd"
};

// Initialize Firebase only if not already
if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

const profileForm = document.getElementById("profile-form");
const messageEl = document.getElementById("message");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const userClass = document.getElementById("class-select").value;

    if (!firstName || !lastName || !userClass) {
      messageEl.textContent = "Please fill all fields.";
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        class: userClass
      }, { merge: true });

      window.location.href = "dashboard.html";
    } catch (err) {
      messageEl.textContent = "Failed to save profile: " + err.message;
    }
  });
});
