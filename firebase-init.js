import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBkQyV-Jqaum9zSoa7a2BkZDV-ea5j1KwY",
    authDomain: "infinity-kit.firebaseapp.com",
    projectId: "infinity-kit",
    storageBucket: "infinity-kit.firebasestorage.app",
    messagingSenderId: "426774511293",
    appId: "1:426774511293:web:b54877b67bc5bf260d41d4",
    measurementId: "G-HHFSC81KYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
