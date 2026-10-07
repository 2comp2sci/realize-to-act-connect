import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopmentAndDemo1234",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "realize-to-act-connect.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "realize-to-act-connect",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "realize-to-act-connect.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
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