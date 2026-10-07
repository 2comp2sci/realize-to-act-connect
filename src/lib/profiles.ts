// Firestore-backed storage for the profile setup answers behind the partner
// "About" page (src/PartnerAbout.tsx).
//
// Firestore schema:
//   users/{uid}                 (private — see src/lib/users.ts)
//     profileAnswers:   { [fieldKey]: string | string[] }   every answer
//     location:         string          mirrored from the "location" answer
//     setupCompletedAt: string (ISO)    set when the setup form is submitted
//     setupSkippedAt:   string (ISO)    set when the user skips setup
//
//   publicProfiles/{uid}        (readable by any signed-in user)
//     uid:       string
//     name:      string
//     userType:  'school' | 'community-partner'
//     avatar:    string | null
//     answers:   { [fieldKey]: string | string[] }   only fields marked public
//     updatedAt: Timestamp (serverTimestamp)
//
// Which fields are public is defined in src/lib/profileFields.ts.

import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase';
import { User, UserType } from '../types';
import { ProfileAnswers, fieldsFor, isAnswered } from './profileFields';

const PUBLIC_PROFILES_COLLECTION = 'publicProfiles';

export interface PublicProfile {
  uid: string;
  name: string;
  userType: UserType;
  avatar?: string;
  answers: ProfileAnswers;
}

export async function getPublicProfile(uid: string): Promise<PublicProfile | null> {
  try {
    const snapshot = await getDoc(doc(db, PUBLIC_PROFILES_COLLECTION, uid));
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        uid,
        name: data.name,
        userType: data.userType,
        avatar: data.avatar ?? undefined,
        answers: data.answers ?? {},
      };
    }
  } catch (err) {
    console.warn('Could not load public profile from Firestore:', err);
  }

  // Fallback to local storage if Firestore is unprovisioned or offline
  try {
    const cached = localStorage.getItem(`profileAnswers_${uid}`);
    if (cached) {
      return {
        uid,
        name: 'Organization',
        userType: 'school',
        answers: JSON.parse(cached),
      };
    }
  } catch (e) {}

  return null;
}

/** Saves setup answers privately on users/{uid} and publishes the public subset to publicProfiles/{uid}. */
export async function saveProfileSetup(user: User, answers: ProfileAnswers): Promise<void> {
  const fields = fieldsFor(user.type);
  const kept: ProfileAnswers = {};
  const publicAnswers: ProfileAnswers = {};
  for (const field of fields) {
    const answer = answers[field.key];
    if (!isAnswered(answer)) continue;
    kept[field.key] = answer;
    if (field.public) publicAnswers[field.key] = answer;
  }

  // Cache locally first so changes persist even if Firestore is unprovisioned or offline
  try {
    localStorage.setItem(`profileAnswers_${user.id}`, JSON.stringify(kept));
    localStorage.setItem(`setupCompleted_${user.id}`, new Date().toISOString());
    if (typeof kept.location === 'string') {
      localStorage.setItem(`location_${user.id}`, kept.location);
    }
  } catch (e) {
    console.warn('Could not save profile setup to localStorage:', e);
  }

  // If running in demo mode or without a signed-in Firebase Auth account, don't attempt Firestore commit
  if (!auth.currentUser || user.id.startsWith('demo-') || user.id === 'user-1') {
    return;
  }

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.id), {
      profileAnswers: kept,
      ...(typeof kept.location === 'string' && { location: kept.location }),
      setupCompletedAt: new Date().toISOString(),
    }, { merge: true });
    batch.set(doc(db, PUBLIC_PROFILES_COLLECTION, user.id), {
      uid: user.id,
      name: user.name,
      userType: user.type,
      avatar: user.avatar ?? null,
      answers: publicAnswers,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (err) {
    console.warn('Could not save profile setup to Firestore, using local persistence:', err);
  }
}

/** Records that the user chose to fill out their profile later, so setup isn't shown on every login. */
export async function skipProfileSetup(uid: string): Promise<void> {
  try {
    localStorage.setItem(`setupSkipped_${uid}`, new Date().toISOString());
  } catch (e) {}

  if (!auth.currentUser || uid.startsWith('demo-') || uid === 'user-1') {
    return;
  }

  try {
    await setDoc(doc(db, 'users', uid), { setupSkippedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not save skip status to Firestore:', err);
  }
}
