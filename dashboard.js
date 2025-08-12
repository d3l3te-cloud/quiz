import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Global variables for Firebase configuration provided by the environment
const firebaseConfig = {
  apiKey: "AIzaSyAfTmjToH6C0Xje5zVI2ZlDFgMuz92nUXs",
  authDomain: "quizzo1-e5157.firebaseapp.com",
  projectId: "quizzo1-e5157",
  storageBucket: "quizzo1-e5157.firebasestorage.app",
  messagingSenderId: "1003232389896",
  appId: "1:1003232389896:web:9abf8f2a9f92dd94b5dabd"
};

// Initialize Firebase
if (!getApps().length) initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// DOM elements
const welcomeEl = document.getElementById("welcome-message");
const signoutBtn = document.getElementById("signout");
const subjectCardsContainer = document.getElementById("subject-cards");
const viewRecordsBtn = document.getElementById("view-records-btn");
const recordsContent = document.getElementById("records-content");
const resultsTable = document.getElementById("results-table");
const resultsBody = document.getElementById("results-body");
const noData = document.getElementById("no-data");

// Define subjects and their icons here - easy to edit!
const subjects = [
    { name: "Mathematics", icon: "fas fa-calculator", redirect: "Quizzes/quiz-maths.html" },
    { name: "Physics", icon: "fas fa-atom", redirect: "Quizzes/quiz-physics.html" },
    { name: "Chemistry", icon: "fas fa-flask", redirect: "Quizzes/quiz-chemistry.html" },
    { name: "Biology", icon: "fas fa-dna", redirect: "Quizzes/quiz-biology.html" },
    // Add more subjects here
];

// Helper to render subject cards
function renderSubjectCards() {
    subjects.forEach(subject => {
        const card = document.createElement("div");
        card.className = "subject-card";
        card.innerHTML = `
            <i class="${subject.icon} subject-icon"></i>
            <h3 class="subject-name">${subject.name}</h3>
        `;
        card.addEventListener("click", () => {
            window.location.href = subject.redirect;
        });
        subjectCardsContainer.appendChild(card);
    });
}

// Helper to fetch and display quiz results
async function fetchQuizResults(user) {
    try {
        const resultsCol = collection(db, "users", user.uid, "results");
        // NOTE: Firestore `orderBy` can cause errors if an index isn't created.
        // We'll fetch all and sort in memory to avoid this.
        const snap = await getDocs(resultsCol);
        
        resultsBody.innerHTML = "";

        if (snap.empty) {
            resultsTable.style.display = "none";
            noData.style.display = "block";
            return;
        }

        noData.style.display = "none";
        resultsTable.style.display = "table";

        // Sort results by timestamp in memory
        const allResults = snap.docs.map(doc => doc.data());
        allResults.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        let i = 1;
        allResults.forEach(r => {
            const date = r.createdAt?.toDate
                ? r.createdAt.toDate()
                : (r.createdAt ? new Date(r.createdAt.seconds * 1000) : new Date());
            const dateStr = date.toLocaleString();

            const minutes = String(Math.floor((r.totalSeconds || 0) / 60)).padStart(2, "0");
            const seconds = String((r.totalSeconds || 0) % 60).padStart(2, "0");
            const timeStr = `${minutes}:${seconds}`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${i++}</td>
                <td>${r.score ?? "-"}</td>
                <td>${r.totalQuestions ?? "-"}</td>
                <td>${timeStr}</td>
                <td>${dateStr}</td>
                <td>${r.quizname ?? "-"}</td>
            `;
            resultsBody.appendChild(tr);
        });
    } catch (e) {
        console.error("Failed to load results:", e);
        noData.textContent = "Failed to load results.";
    }
}

// Event listeners
signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

viewRecordsBtn.addEventListener("click", () => {
    // Toggle the visibility of the records content
    if (recordsContent.style.display === 'none') {
        recordsContent.style.display = 'block';
        viewRecordsBtn.textContent = 'Hide Records';
    } else {
        recordsContent.style.display = 'none';
        viewRecordsBtn.textContent = 'View Records';
    }
});

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

// On auth state change, fetch and display user data and results
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            const userName = data.firstName || user.email || "User";
            const userClass = data.class || "N/A";
            welcomeEl.textContent = `Welcome, ${userName}!`;
        } else {
            welcomeEl.textContent = `Welcome, User!`;
        }
    } catch (err) {
        console.error("Failed to fetch user data:", err);
    }

    // Render subject cards
    renderSubjectCards();

    // Fetch quiz results
    fetchQuizResults(user);
});
