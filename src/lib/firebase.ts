import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Firebase web config for the realize-to-act-connect project. These values
// are not secrets (they ship in every built bundle); access is enforced by
// firestore.rules and Firebase Auth. VITE_FIREBASE_* env vars override them,
// e.g. to point a local build at a different project.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCFgAH1z0PbSa0yJQXsYlVQl3zclzF_9YU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "realize-to-act-connect.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "realize-to-act-connect",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "realize-to-act-connect.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "592699387827",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:592699387827:web:f6b8de557ca07de50465c6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Firestore's default transport opens a streaming WebChannel connection
// (requests whose URL contains "channel?..."). Some ad blockers/privacy
// extensions and campus/corporate proxies block or interrupt that pattern,
// which makes writes appear to succeed locally (optimistic UI) but never
// actually reach the backend. Auto-detecting long polling falls back to
// plain request/response polling when the streaming transport isn't
// reliable, which is far more compatible with those environments.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const googleProvider = new GoogleAuthProvider();