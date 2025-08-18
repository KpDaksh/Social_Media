// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { connectFirestoreEmulator } from 'firebase/firestore'
import { connectAuthEmulator } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// If running locally with emulator, connect to emulators when the env flag is set
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === '1') {
  try {
    // Default emulator ports used by Firebase CLI
    connectStorageEmulator(storage, 'localhost', 9199)
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.log('Connected to Firebase emulators (storage, firestore, auth)')
  } catch (e) {
    // ignore in production or if functions not available in this build
    console.warn('Could not connect to Firebase emulators:', e)
  }
}

export { auth, db, analytics, storage };