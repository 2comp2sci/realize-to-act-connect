export type UserType = 'school' | 'community-partner';

export interface AvailabilitySlot {
  day: string;
  slots: string[];
}

export interface User {
  id: string;
  name: string;
  type: UserType;
  email: string;
  avatar?: string;
  location?: string;
  contactName?: string;
  contactPerson?: string;
  contactRole?: string;
  role?: string;
  phone?: string;
  about?: string;
  state?: string;
  availability?: AvailabilitySlot[];
  dropOffLocation?: string;
  dropOffDetails?: string;
  teamEmails?: string[];
  needDropOffAssistance?: boolean;
  allowAvailabilityView?: boolean;
  profileAnswers?: Record<string, string | string[]>;
  setupCompletedAt?: string;
  setupSkippedAt?: string;
}

export interface SchoolResourceRequest {
  id?: string;
  submittedAt?: string;
  schoolName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  state: string;
  requestScope: 'district' | 'school';
  districtSchoolsCount?: number;
  districtStudentsCount?: number;
  schoolStudentsCount?: number;
  expectedStudentsInNeed: number;
  selectedCategories: string[];
  backpacks?: {
    gradeBands: string[];
    solidQty: number;
    clearQty: number;
    mandateStatus?: string;
  };
  schoolSupplies?: {
    packagedKits: boolean;
    kitPackagingPreference?: string;
    items: { [itemName: string]: number };
    deliveryMethod?: string;
  };
  hygiene?: {
    items: { [itemName: string]: number };
    sprayDeodorant?: boolean;
    stickDeodorant?: boolean;
    pads?: boolean;
    tampons?: boolean;
    gradeBands: string[];
  };
  cleaning?: {
    items: { [itemName: string]: number };
  };
  clothing?: {
    garmentTypes: string[];
    kidsSizes: string[];
    adultSizes: string[];
    shoeSizes: string[];
  };
  food?: {
    categories: string[];
    snacks: string[];
    nonperishables: string[];
    frozen: string[];
  };
  enrichment?: {
    timeForKids: boolean;
    whatSparksYouWorkshop: boolean;
    stemKits: boolean;
    notes?: string;
  };
  logistics?: {
    method: string;
    eventDate?: string;
    specialInstructions?: string;
  };
}

export interface ConnectionRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  type: 'received' | 'sent';
  status: 'pending' | 'approved' | 'denied';
  item: string;
  quantity: number;
  distance: string;
  timeAgo: string;
  timestamp: number; // Added for sorting
  postedAt?: string;
  availableUntil?: string;
  description?: string;
  availability?: AvailabilitySlot[];
  isNew?: boolean;
  schoolRequestData?: SchoolResourceRequest;
}

// A LinkedIn-style connection between two organizations (src/lib/connections.ts),
// as seen by the signed-in user. Not to be confused with ConnectionRequest,
// which is a resource/supply request.
export interface Connection {
  id: string;
  partnerUid: string;
  partnerName: string;
  partnerAvatar?: string;
  partnerType?: UserType;
  status: 'pending' | 'accepted';
  direction: 'incoming' | 'outgoing';
  source: 'search' | 'request';
  timestamp: number;
}

export interface Organization {
  uid: string;
  name: string;
  type: UserType;
  avatar?: string;
  location?: string;
}

export interface Document {
  id: string;
  title: string;
  fromName: string;
  toName: string;
  status: 'pending' | 'signed';
  dueDate?: string;
  signedDate?: string;
  timeAgo: string;
  itemDescription: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSuggestedTime?: boolean;
  suggestedTimes?: string[];
  confirmedTime?: string;
  meetingNote?: string;
}

export interface Chat {
  id: string;
  participantName: string;
  participantTitle: string;
  participantAvatar?: string;
  participantUid?: string; // uid of the other participant, once backed by Firestore
  lastMessage?: string;
  timeAgo: string;
  lastMessageTimestamp?: number;
  unreadCount?: number;
  messages?: Message[];
  isRecentlyApproved?: boolean;
}
