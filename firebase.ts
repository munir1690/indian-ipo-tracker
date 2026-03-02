import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "REDACTED_API_KEY",
  authDomain: "armys-alpha-ipo.firebaseapp.com",
  projectId: "armys-alpha-ipo",
  storageBucket: "armys-alpha-ipo.firebasestorage.app",
  messagingSenderId: "REDACTED_SENDER_ID",
  appId: "1:REDACTED_SENDER_ID:web:1006debbfb7a841a3921ee",
  measurementId: "REDACTED_MEASUREMENT_ID"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with standard getAuth
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, db, auth };
