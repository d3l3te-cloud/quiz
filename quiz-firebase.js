// quiz-firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Your Firebase config from Firebase Console ---
const firebaseConfig = {
  apiKey: "AIzaSyAfTmjToH6C0Xje5zVI2ZlDFgMuz92nUXs",
  authDomain: "quizzo1-e5157.firebaseapp.com",
  projectId: "quizzo1-e5157",
  storageBucket: "quizzo1-e5157.firebasestorage.app",
  messagingSenderId: "1003232389896",
  appId: "1:1003232389896:web:9abf8f2a9f92dd94b5dabd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Save quiz results for current user
window.saveQuizResult = async function (resultData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const colRef = collection(db, "users", user.uid, "results");
  const docRef = await addDoc(colRef, {
    ...resultData,
    createdAt: serverTimestamp()
  });

  return docRef.id;
};
