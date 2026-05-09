// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDHg3yKwBwLxzkx7odMV-2N6oL5fONlNOM",
    authDomain: "hospital-managment-syste-cff22.firebaseapp.com",
    projectId: "hospital-managment-syste-cff22",
    storageBucket: "hospital-managment-syste-cff22.firebasestorage.app",
    messagingSenderId: "365926722310",
    appId: "1:365926722310:web:fffbc77d6f77beda084c87",
    measurementId: "G-VT0T2XDBVN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services (export as needed)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const rtdb = getDatabase(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
