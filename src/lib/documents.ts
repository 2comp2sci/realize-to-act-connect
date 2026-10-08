// Firestore-backed storage for acknowledgement letters ("Documents Awaiting
// Signature"). Backs the Documents screen (src/Documents.tsx) and the
// Dashboard's signature widget; a letter is created when a resource request
// is approved from the Dashboard.
//
// Firestore schema — collection "documents":
//   participantUids: [uidA, uidB]   the two organizations on the request
//   ownerUid:        string         who created the letter and signs it
//   requestId:       string | null  the approved resource request
//   title:           string
//   fromName:        string         the partner the items came from
//   toName:          string         the organization acknowledging receipt
//   itemDescription: string
//   status:          'pending' | 'signed'
//   dueDate:         string | null
//   signedDate:      string | null
//   createdAt:       Timestamp (serverTimestamp)
//   updatedAt:       Timestamp (serverTimestamp)

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { formatTimeAgo } from './requests';
import { Document } from '../types';

const DOCUMENTS_COLLECTION = 'documents';

export interface NewDocumentInput {
  ownerUid: string;
  partnerUid: string;
  requestId?: string;
  title: string;
  fromName: string;
  toName: string;
  itemDescription: string;
  dueDate?: string;
}

function toDocument(id: string, data: DocumentData): Document & { timestamp: number } {
  const timestamp = data.createdAt?.toMillis?.() ?? Date.now();
  return {
    id,
    title: data.title,
    fromName: data.fromName,
    toName: data.toName,
    status: data.status,
    dueDate: data.dueDate ?? undefined,
    signedDate: data.signedDate ?? undefined,
    timeAgo: formatTimeAgo(timestamp),
    itemDescription: data.itemDescription ?? '',
    timestamp,
  };
}

/** Subscribes to every document the uid is a participant on, newest first. */
export function subscribeToDocuments(uid: string, onChange: (documents: Document[]) => void): Unsubscribe {
  const documentsQuery = query(collection(db, DOCUMENTS_COLLECTION), where('participantUids', 'array-contains', uid));
  return onSnapshot(
    documentsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs
          .map((docSnap) => toDocument(docSnap.id, docSnap.data()))
          .sort((a, b) => b.timestamp - a.timestamp)
      );
    },
    // e.g. permission-denied if the documents rules haven't been deployed yet.
    (err) => {
      console.error('Could not load documents', err);
      onChange([]);
    }
  );
}

export async function createDocument(input: NewDocumentInput): Promise<string> {
  const ref = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
    participantUids: [input.ownerUid, input.partnerUid],
    ownerUid: input.ownerUid,
    requestId: input.requestId ?? null,
    title: input.title,
    fromName: input.fromName,
    toName: input.toName,
    itemDescription: input.itemDescription,
    status: 'pending',
    dueDate: input.dueDate ?? null,
    signedDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function signDocument(documentId: string, signedDate: string): Promise<void> {
  await updateDoc(doc(db, DOCUMENTS_COLLECTION, documentId), {
    status: 'signed',
    signedDate,
    updatedAt: serverTimestamp(),
  });
}

/** Rejects/removes a document (Documents.tsx "delete" flow). */
export async function deleteDocument(documentId: string): Promise<void> {
  await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
}
