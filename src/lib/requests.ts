// Firestore-backed storage for connection/supply requests (sent & received).
// Backs the "Requests Management" screen (src/Requests.tsx) as well as the
// quick-approve actions on the Dashboard.
//
// Firestore schema — collection "requests":
//   fromUid:      string            uid of the requester
//   fromName:     string            display name of the requester
//   fromAvatar:   string            avatar URL of the requester
//   toUid:        string | null     uid of the specific recipient, or null to
//                                   broadcast the request to every partner
//   toName:       string | null     display name of the recipient (if any)
//   toAvatar:     string | null     avatar URL of the recipient (if any)
//   item:         string
//   quantity:     number
//   distance:     string
//   description:  string
//   availability: AvailabilitySlot[] | null
//   status:       'pending' | 'approved' | 'denied'
//   createdAt:    Timestamp (serverTimestamp)
//   updatedAt:    Timestamp (serverTimestamp)
//
// "Sent" vs "received" not stored, derived per-viewer from fromUid.

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
  type Query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { AvailabilitySlot, ConnectionRequest } from '../types';

const REQUESTS_COLLECTION = 'requests';

export interface NewRequestInput {
  fromUid: string;
  fromName: string;
  fromAvatar: string;
  toUid: string | null;
  toName?: string | null;
  toAvatar?: string | null;
  item: string;
  quantity: number;
  distance?: string;
  description?: string;
  availability?: AvailabilitySlot[];
}

function toConnectionRequest(id: string, data: DocumentData, viewerUid: string): ConnectionRequest {
  const isSent = data.fromUid === viewerUid;
  return {
    id,
    fromId: isSent ? (data.toUid ?? 'everyone') : data.fromUid,
    fromName: isSent ? (data.toName ?? 'Everyone') : data.fromName,
    fromAvatar: isSent ? (data.toAvatar ?? data.fromAvatar) : data.fromAvatar,
    type: isSent ? 'sent' : 'received',
    status: data.status,
    item: data.item,
    quantity: data.quantity,
    distance: data.distance ?? 'N/A',
    timeAgo: '',
    timestamp: data.createdAt?.toMillis?.() ?? Date.now(),
    description: data.description ?? undefined,
    availability: data.availability ?? undefined,
    isNew: data.status === 'pending' && !isSent,
  };
}

/**
 * Subscribes to every request the given uid can see: requests they sent,
 * requests addressed directly to them, and open broadcast requests (toUid
 * == null) from everyone else. Calls `onChange` with the merged, sorted
 * list every time any of the underlying queries update.
 */
export function subscribeToRequests(
  uid: string,
  onChange: (requests: ConnectionRequest[]) => void
): Unsubscribe {
  const results = new Map<string, ConnectionRequest>();

  const emit = () => {
    onChange(Array.from(results.values()).sort((a, b) => b.timestamp - a.timestamp));
  };

  const attach = (q: Query<DocumentData>) =>
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          results.delete(change.doc.id);
          return;
        }
        const data = change.doc.data();
        // A broadcast request the viewer sent themselves is already
        // covered by the "sent" query below — skip the duplicate.
        if (data.toUid === null && data.fromUid === uid) return;
        results.set(change.doc.id, toConnectionRequest(change.doc.id, data, uid));
      });
      emit();
    });

  const sentQuery = query(collection(db, REQUESTS_COLLECTION), where('fromUid', '==', uid));
  const receivedQuery = query(collection(db, REQUESTS_COLLECTION), where('toUid', '==', uid));
  const broadcastQuery = query(collection(db, REQUESTS_COLLECTION), where('toUid', '==', null));

  const unsubscribes = [attach(sentQuery), attach(receivedQuery), attach(broadcastQuery)];
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}

/** Creates a new request document (a "sent" request from the caller's perspective). */
export async function createRequest(input: NewRequestInput): Promise<string> {
  const ref = await addDoc(collection(db, REQUESTS_COLLECTION), {
    fromUid: input.fromUid,
    fromName: input.fromName,
    fromAvatar: input.fromAvatar,
    toUid: input.toUid ?? null,
    toName: input.toName ?? null,
    toAvatar: input.toAvatar ?? null,
    item: input.item,
    quantity: input.quantity,
    distance: input.distance ?? 'N/A',
    description: input.description ?? '',
    availability: input.availability ?? null,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Approves or denies a request. `respondingUid`/`respondingName`/`respondingAvatar`
 * should be supplied when claiming a broadcast (toUid == null) request, so the
 * request becomes attributed to whoever acted on it.
 */
export async function respondToRequest(
  requestId: string,
  status: 'approved' | 'denied',
  claim?: { uid: string; name: string; avatar: string }
): Promise<void> {
  const update: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (claim) {
    update.toUid = claim.uid;
    update.toName = claim.name;
    update.toAvatar = claim.avatar;
  }
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), update);
}

/** Cancels a request the current user sent (only the sender is allowed to, per firestore.rules). */
export async function cancelRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, REQUESTS_COLLECTION, requestId));
}
