import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    signInWithCustomToken,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Global variables for Firebase configuration provided by the environment
// Your Firebase Config
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements for UI animation
const container = document.getElementById("container");
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");

// Event listeners for the sliding animation
signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

// DOM elements for Firebase authentication and messages
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const googleSigninSignupBtn = document.getElementById("google-signin-signup");
const googleSigninLoginBtn = document.getElementById("google-signin-login");
const signoutBtn = document.getElementById("signout");
const userInfoDiv = document.getElementById("user-info");
const userDetailsP = document.getElementById("user-details");
const userIdP = document.getElementById("user-id");
const signupMessage = document.getElementById("signup-message");
const loginMessage = document.getElementById("login-message");

// Helper to show messages
function showMessage(msg, targetElement) {
    if (targetElement) {
        targetElement.textContent = msg;
    }
}

// Initial authentication check
async function initializeAuth() {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Firebase auth error:", error);
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    const authForms = document.getElementById("auth-forms");
    if (user) {
        // User is signed in, show user info
        container.classList.remove("right-panel-active");
        userInfoDiv.style.display = "flex";
        // Hide forms by default and only show if the user isn't authenticated
        document.querySelector('.form-container.sign-up-container').style.display = 'none';
        document.querySelector('.form-container.sign-in-container').style.display = 'none';
        document.querySelector('.overlay-container').style.display = 'none';

        userDetailsP.textContent = user.email || "Anonymous User";
        userIdP.textContent = user.uid;
        
        // Check profile completeness, redirect accordingly
        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        const data = userDocSnap.exists() ? userDocSnap.data() : {};
        if (!data.firstName || !data.lastName || !data.class) {
            window.location.href = "profile-setup.html";
        } else {
            window.location.href = "dashboard.html";
        }
    } else {
        // User is signed out, show forms
        userInfoDiv.style.display = "none";
        document.querySelector('.form-container.sign-up-container').style.display = 'block';
        document.querySelector('.form-container.sign-in-container').style.display = 'block';
        document.querySelector('.overlay-container').style.display = 'block';
    }
});


// Signup with email/password
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.", signupMessage);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Create minimal user doc (no profile yet)
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: serverTimestamp()
            });
            showMessage(`Account created for ${user.email}`, signupMessage);
            signupForm.reset();

            // Redirect to profile setup
            window.location.href = "profile-setup.html";
        } catch (err) {
            showMessage(err.message, signupMessage);
        }
    });
}

// Login with email/password
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            showMessage(`Signed in: ${userCredential.user.email}`, loginMessage);
            loginForm.reset();

            // Check profile completeness, redirect accordingly
            const user = userCredential.user;
            const userDocSnap = await getDoc(doc(db, "users", user.uid));
            const data = userDocSnap.exists() ? userDocSnap.data() : {};
            if (!data.firstName || !data.lastName || !data.class) {
                window.location.href = "profile-setup.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } catch (err) {
            showMessage(err.message, loginMessage);
        }
    });
}

// Google sign-in
function handleGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            // Check if profile data exists
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let data = userDocSnap.exists() ? userDocSnap.data() : {};

            // Save minimal user info + keep existing fields if any
            await setDoc(userDocRef, {
                username: user.displayName || null,
                email: user.email,
                provider: "google",
                lastLogin: serverTimestamp(),
                ...data // preserve existing fields like firstName, lastName, class
            }, { merge: true });

            if (!data.firstName || !data.lastName || !data.class) {
                window.location.href = "profile-setup.html";
            } else {
                window.location.href = "dashboard.html";
            }
        })
        .catch((err) => {
            showMessage(err.message, document.getElementById("messages"));
        });
}

if (googleSigninSignupBtn) {
    googleSigninSignupBtn.addEventListener("click", handleGoogleSignIn);
}

if (googleSigninLoginBtn) {
    googleSigninLoginBtn.addEventListener("click", handleGoogleSignIn);
}

// Sign out
if (signoutBtn) {
    signoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });
}