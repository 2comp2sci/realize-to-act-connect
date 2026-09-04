// Firestore-backed storage for chats and messages (sent & received).
// Backs the "Messages" screen (src/Messages.tsx).
//
// Firestore schema:
//   chats/{chatId}
//     participantUids:     [uidA, uidB]
//     participants:        { [uid]: { name, title, avatar } }
//     lastMessage:         string | null
//     lastMessageTimestamp: Timestamp
//     createdAt:           Timestamp
//
//   chats/{chatId}/messages/{messageId}
//     senderId:      string (uid)
//     text:          string
//     createdAt:     Timestamp (serverTimestamp)
//     isSuggestedTime?: boolean
//     suggestedTimes?:  string[]
//     confirmedTime?:   string
//     meetingNote?:     string
//
// `chatId` is deterministic — the two participant uids sorted and joined —
// so re-messaging the same partner always resolves to the same document.

import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Chat, Message } from '../types';

const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';

export interface ChatParticipantInfo {
  name: string;
  title: string;
  avatar?: string;
}

/** Deterministic chat id for a pair of participants. */
export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

/** Creates the chat document for a pair of participants if it doesn't already exist. */
export async function ensureChat(
  viewerUid: string,
  viewerInfo: ChatParticipantInfo,
  partnerUid: string,
  partnerInfo: ChatParticipantInfo
): Promise<string> {
  const chatId = getChatId(viewerUid, partnerUid);
  const ref = doc(db, CHATS_COLLECTION, chatId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      participantUids: [viewerUid, partnerUid],
      participants: { [viewerUid]: viewerInfo, [partnerUid]: partnerInfo },
      lastMessage: null,
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
  return chatId;
}

function toMessage(id: string, data: DocumentData): Message {
  const createdAt: Timestamp | undefined = data.createdAt;
  return {
    id,
    senderId: data.senderId,
    text: data.text,
    timestamp: createdAt ? createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    isSuggestedTime: data.isSuggestedTime,
    suggestedTimes: data.suggestedTimes,
    confirmedTime: data.confirmedTime,
    meetingNote: data.meetingNote,
  };
}

/** Subscribes to the list of chats (metadata only, no messages) the uid participates in. */
export function subscribeToChats(uid: string, onChange: (chats: Chat[]) => void): Unsubscribe {
  const chatsQuery = query(collection(db, CHATS_COLLECTION), where('participantUids', 'array-contains', uid));
  return onSnapshot(chatsQuery, (snapshot) => {
    const chats: Chat[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const participantUids: string[] = data.participantUids ?? [];
      const partnerUid = participantUids.find((id) => id !== uid);
      const partner = partnerUid ? data.participants?.[partnerUid] : undefined;
      return {
        id: docSnap.id,
        participantName: partner?.name ?? 'Unknown',
        participantTitle: partner?.title ?? '',
        participantAvatar: partner?.avatar,
        participantUid: partnerUid,
        lastMessage: data.lastMessage ?? undefined,
        timeAgo: '',
        lastMessageTimestamp: data.lastMessageTimestamp?.toMillis?.() ?? 0,
      };
    });
    onChange(chats.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)));
  });
}

/** Subscribes to the ordered messages of a single chat. */
export function subscribeToMessages(chatId: string, onChange: (messages: Message[]) => void): Unsubscribe {
  const messagesQuery = query(collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION), orderBy('createdAt', 'asc'));
  return onSnapshot(messagesQuery, (snapshot) => {
    onChange(snapshot.docs.map((docSnap) => toMessage(docSnap.id, docSnap.data())));
  });
}

export interface SendMessageInput {
  senderId: string;
  text: string;
  isSuggestedTime?: boolean;
  suggestedTimes?: string[];
  confirmedTime?: string;
  meetingNote?: string;
}

/** Appends a message to a chat and updates the chat's lastMessage preview. */
export async function sendMessage(chatId: string, input: SendMessageInput): Promise<void> {
  await addDoc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
    lastMessage: input.text,
    lastMessageTimestamp: serverTimestamp(),
  });
}
