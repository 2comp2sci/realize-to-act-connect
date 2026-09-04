<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/59cd6b78-5cda-4041-b02b-8824bc64eb14

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend: Firebase Auth + Firestore

Messages, chats, and connection/supply requests (sent & received) are stored
in Cloud Firestore and read live via `onSnapshot` — there is no separate
server. The data-access code lives in `src/lib/requests.ts` and
`src/lib/chats.ts`; the schema and security rules are documented at the top
of those files and in `firestore.rules`.

### One-time Firebase project setup

1. Create a project at https://console.firebase.google.com, then enable
   **Authentication** (Email/Password + Google providers) and **Firestore**.
2. In Project Settings > General > "Your apps", add a Web app and copy its
   config values into a `.env.local` (see `.env.example` for the required
   `VITE_FIREBASE_*` keys).
3. Set the project id in `.firebaserc` (replace
   `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`).
4. Install the Firebase CLI if you don't have it: `npm install -g firebase-tools`,
   then `firebase login`.

### Deploying

```
npm run build   # outputs to dist/, matches firebase.json's hosting.public
npm run deploy   # builds, then deploys Hosting + Firestore rules/indexes
```

`npm run deploy` is equivalent to
`firebase deploy --only hosting,firestore:rules,firestore:indexes`, which
pushes:
- `dist/` (the Vite build output) to Firebase Hosting, per `firebase.json`.
- `firestore.rules` — access control for the `users`, `requests`, and
  `chats`/`messages` collections.
- `firestore.indexes.json` — composite indexes required by the
  `subscribeToRequests`/`subscribeToChats` queries.

Remember to add your deployed Hosting domain (and `localhost` for local dev)
to Authentication > Settings > Authorized domains in the Firebase Console,
and to redeploy `firestore.rules`/`firestore.indexes.json` any time the
schema in `src/lib/requests.ts` or `src/lib/chats.ts` changes.
