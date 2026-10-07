# Direct Firebase Configuration & API Key Fix Plan

Eliminate `.env` file resolution issues on Windows and resolve `auth/api-key-not-valid` by embedding your Firebase configuration directly into `src/lib/firebase.ts`.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Why `.env` often fails on Windows:**
> 1. **The `.env.txt` Trap**: When creating `.env` in Windows Notepad or File Explorer, Windows silently appends `.txt` (creating `.env.txt`), which Vite cannot read.
> 2. **Whitespace or Quotes**: Spaces around `=` (e.g. `KEY = VAL`) or trailing quotes in `.env` cause Vite to include invalid characters in the API key.
>
> In Firebase client applications, the `firebaseConfig` object is public and designed to be bundled directly in your source code. Placing it directly in `src/lib/firebase.ts` completely bypasses `.env` parsing and guarantees the real key is compiled.

---

## 1. Solution: Embed Config Directly in `src/lib/firebase.ts`

Replace the top of your local `src/lib/firebase.ts` with your exact config copied from the Firebase Console (with commas between properties):

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Paste your exact values from Firebase Console -> Project Settings -> General -> Your apps (Web)
const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "realize-to-act-connect.firebaseapp.com",
  projectId: "realize-to-act-connect",
  storageBucket: "realize-to-act-connect.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const googleProvider = new GoogleAuthProvider();
```

> **Note on commas**: In JavaScript/TypeScript objects, every line inside `{ ... }` must end with a comma `,` (except optionally the last one).

---

## 2. Check Google Cloud API Key Restrictions (If Key is Still Invalid)

If your real key was entered and Google still returns `auth/api-key-not-valid`:
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) for `realize-to-act-connect`.
2. Look for the key named **"Browser key (auto created by Firebase)"** or **"Identity toolkit key"**.
3. Click to edit it:
   - Under **API restrictions**: If set to "Restrict key", ensure **Identity Toolkit API** and **Token Service API** are checked in the list of allowed APIs (or set to "Don't restrict key" for testing).
   - Under **Application restrictions**: If set to "Websites", ensure `realize-to-act-connect.web.app` and `localhost` are listed.

---

## 3. Rebuild and Deploy

1. Rebuild with the direct config:
   ```bash
   npm run build
   ```
2. Deploy to Firebase:
   ```bash
   npx firebase-tools deploy --only hosting,firestore:rules
   ```
3. Hard refresh your browser (`Ctrl+F5`) and submit account creation.
