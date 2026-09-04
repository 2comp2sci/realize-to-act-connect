import { ConnectionRequest, Document, Chat } from './types';

export const MOCK_USER = {
  id: 'user-1',
  name: 'Midland Elementary School',
  type: 'school' as const,
  email: 'midland@school.edu',
  avatar: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop',
  location: 'Midland, Ohio',
  contactName: 'Jane Doe',
  availability: [
    { day: 'MON', slots: ['8:00 AM', '9:00 AM', '10:00 AM'] },
    { day: 'TUES', slots: ['11:00 AM'] },
    { day: 'WED', slots: ['8:00 AM', '9:00 AM', '10:00 AM'] },
    { day: 'THURS', slots: ['11:00 AM'] },
    { day: 'FRI', slots: [] },
  ],
  dropOffLocation: 'Main Entrance, Reception Desk'
};

export const MOCK_CONNECTIONS: ConnectionRequest[] = [
  {
    id: 'conn-1',
    fromId: 'np-1',
    fromName: 'Hope Feeling Foundation',
    fromAvatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&h=150&fit=crop',
    type: 'received',
    status: 'pending',
    item: 'Biology Textbooks',
    quantity: 200,
    distance: '2 mi away',
    timeAgo: '50 mins ago',
    timestamp: Date.now() - 50 * 60 * 1000,
    description: 'Our mission is to share hope with those in need by providing support and fostering community growth.',
    availability: [
      { day: 'MON', slots: ['8:00 AM', '9:00 AM', '1:00 PM', '2:00 PM'] },
      { day: 'WED', slots: ['8:00 AM', '9:00 AM', '1:00 PM', '2:00 PM'] },
    ],
    isNew: true,
    postedAt: '2 days ago',
    availableUntil: '1 week'
  },
  {
    id: 'conn-2',
    fromId: 'np-2',
    fromName: "The Woman's Shelter",
    fromAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150&h=150&fit=crop',
    type: 'received',
    status: 'pending',
    item: 'Backpacks',
    quantity: 200,
    distance: '3 mi away',
    timeAgo: '50 mins ago',
    timestamp: Date.now() - 50 * 60 * 1000,
    description: 'We strive to connect those in need with resources that bring warmth, safety, and dignity to every individual.',
    availability: [
      { day: 'TUES', slots: ['9:00 AM', '10:00 AM'] },
      { day: 'THURS', slots: ['9:00 AM', '10:00 AM'] },
    ],
    isNew: true,
    postedAt: '3 days ago',
    availableUntil: '2 weeks'
  },
  {
    id: 'conn-5',
    fromId: 'np-5',
    fromName: 'Youth Empowerment Fund',
    fromAvatar: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&h=150&fit=crop',
    type: 'sent',
    status: 'pending',
    item: 'Art Supplies',
    quantity: 50,
    distance: '0.5 mi away',
    timeAgo: '10 mins ago',
    timestamp: Date.now() - 10 * 60 * 1000,
    description: 'Empowering youth through creative expression and dedicated community support programs.',
    availability: [
      { day: 'FRI', slots: ['2:00 PM', '3:00 PM'] },
    ],
    postedAt: 'Just now',
    availableUntil: '3 days'
  },
  {
    id: 'conn-3',
    fromId: 'np-3',
    fromName: 'Youth Outreach',
    fromAvatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&h=150&fit=crop',
    type: 'sent',
    status: 'approved',
    item: 'Mathematics Textbooks',
    quantity: 150,
    distance: '1 mi away',
    timeAgo: '2 hours ago',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    description: 'Providing educational support and developmental resources to underprivileged youth in the local area.',
    availability: [
      { day: 'MON', slots: ['9:00 AM', '10:00 AM'] },
      { day: 'WED', slots: ['9:00 AM', '10:00 AM'] },
    ],
    postedAt: '5 days ago',
    availableUntil: 'Expired'
  },
  {
    id: 'conn-4',
    fromId: 'np-4',
    fromName: 'Network Center',
    fromAvatar: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&h=150&fit=crop',
    type: 'sent',
    status: 'approved',
    item: 'Notebooks',
    quantity: 171,
    distance: '1.5 mi away',
    timeAgo: '2 hours ago',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    description: 'Connecting community members with essential support and networking opportunities for a better future.',
    availability: [
      { day: 'TUES', slots: ['2:00 PM', '3:00 PM'] },
      { day: 'THURS', slots: ['2:00 PM', '3:00 PM'] },
    ],
    postedAt: '1 week ago',
    availableUntil: 'Indefinite'
  },
  {
    id: 'conn-6',
    fromId: 'np-6',
    fromName: 'Leader of Tomorrow Non-Profit',
    fromAvatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&h=150&fit=crop',
    type: 'received',
    status: 'approved',
    item: 'Backpacks',
    quantity: 100,
    distance: '4 mi away',
    timeAgo: '1 day ago',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    description: 'Empowering the next generation of leaders with the tools and mentorship they need to succeed.',
    availability: [
      { day: 'MON', slots: ['8:00 AM', '9:00 AM'] },
      { day: 'WED', slots: ['8:00 AM', '9:00 AM'] },
    ],
    postedAt: '2 days ago',
    availableUntil: '4 days'
  }
];

export const MOCK_SEARCH_USERS = [
  {
    id: 'search-1',
    name: 'Community Food Bank',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=150&h=150&fit=crop',
    location: 'Downtown Midland',
    distance: '1.2 mi away',
    distanceValue: 1.2,
    description: 'Dedicated to serving families in need and ensuring that no one in our community is left behind.',
    tags: ['Food', 'Community'],
    quantity: 500,
    postedAt: '1 day ago',
    availableUntil: '3 days'
  },
  {
    id: 'search-2',
    name: 'Tech for All',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=150&h=150&fit=crop',
    location: 'University Circle',
    distance: '3.5 mi away',
    distanceValue: 3.5,
    description: 'Our mission is to bridge the digital divide and provide technological access for students in underserved communities.',
    tags: ['Technology', 'Education'],
    quantity: 25,
    postedAt: '4 hours ago',
    availableUntil: '1 week'
  },
  {
    id: 'search-3',
    name: 'Clean Start Hygiene',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&h=150&fit=crop',
    location: 'West Side',
    distance: '2.8 mi away',
    distanceValue: 2.8,
    description: 'Committed to improving community health and well-being by distributing essential care items to those who need them most.',
    tags: ['Hygiene', 'Health'],
    quantity: 150,
    postedAt: '6 hours ago',
    availableUntil: '5 days'
  },
  {
    id: 'search-4',
    name: 'Scholastic Support',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&h=150&fit=crop',
    location: 'East Midland',
    distance: '4.1 mi away',
    distanceValue: 4.1,
    description: 'Empowering students through literacy and education by supporting schools with essential classroom support.',
    tags: ['Education', 'Books'],
    quantity: 300,
    postedAt: '2 days ago',
    availableUntil: '2 weeks'
  }
];

export const MOCK_SUGGESTED_MATCHES = [
  {
    id: 'suggest-1',
    name: 'Global Education Initiative',
    avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&h=150&fit=crop',
    description: 'Providing global resources for local schools.',
    tags: ['Education', 'Global'],
    item: 'Educational Kits',
    quantity: 100,
    distance: '5 mi away'
  },
  {
    id: 'suggest-2',
    name: 'Healthy Kids Foundation',
    avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&h=150&fit=crop',
    description: 'Focusing on nutrition and health for students.',
    tags: ['Health', 'Food'],
    item: 'Nutrition Bars',
    quantity: 500,
    distance: '3.2 mi away'
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Letter of Acknowledgement - Youth Outreach',
    fromName: 'Youth Outreach',
    toName: 'Midland Elementary School',
    status: 'pending',
    dueDate: 'Due Tomorrow',
    timeAgo: '2 hours ago',
    itemDescription: 'approved 150 mathematic textbooks',
  },
  {
    id: 'doc-2',
    title: 'Letter of Acknowledgement - Network Center',
    fromName: 'Network Center',
    toName: 'Midland Elementary School',
    status: 'pending',
    dueDate: 'Due in 5 days',
    timeAgo: '2 hours ago',
    itemDescription: 'approved 171 notebooks',
  },
  {
    id: 'doc-3',
    title: 'Letter of Acknowledgement - Leader of Tomorrow Non-Profit',
    fromName: 'Leader of Tomorrow Non-Profit',
    toName: 'Midland Elementary School',
    status: 'signed',
    signedDate: '10-12-2025',
    timeAgo: '2 days ago',
    itemDescription: 'approved 100 backpacks',
  }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    participantName: 'Leader of Tomorrow Non-Profit',
    participantTitle: 'Director Marcus Smith',
    participantAvatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&h=150&fit=crop',
    lastMessage: 'Great, thank you! Since the time is confirmed for 9:00 AM, let\'s meet at the East Wing Entrance.',
    timeAgo: '1 day ago',
    lastMessageTimestamp: Date.now() - 24 * 60 * 60 * 1000,
    messages: [
      {
        id: 'm1',
        senderId: 'user-1',
        text: "Hello Director Smith, we are excited about the upcoming Leadership Workshop. We've finalized the list of 50 students who will be attending. Could you confirm if the workshop materials and backpacks are ready for drop off?",
        timestamp: 'Yesterday 10:00 AM',
        isSuggestedTime: true,
        suggestedTimes: ['Mon, 03/10/26: 9:00 AM', 'Mon, 03/10/26: 10:00 AM', 'Tue, 03/11/26: 1:00 PM', 'Wed, 03/12/26: 8:00 AM']
      },
      {
        id: 'm2',
        senderId: 'np-6',
        text: "Hi! Yes, the materials are all set. We have 50 leadership kits and backpacks ready for your students. I've also included some extra resources for the teachers. See you on Monday!",
        timestamp: 'Yesterday, 2:15 PM',
        confirmedTime: 'Mon, 03/10/26: 9:00 AM'
      },
      {
        id: 'm2-note',
        senderId: 'user-1',
        text: "Great, thank you! Since the time is confirmed for 9:00 AM, let's meet at the East Wing Entrance. I'll have a few student leaders there to help unload.",
        timestamp: 'Yesterday, 2:30 PM',
        meetingNote: "East Wing Entrance"
      }
    ]
  },
  {
    id: 'chat-2',
    participantName: 'Network Center',
    participantTitle: 'Mrs. Emily Jones',
    participantAvatar: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&h=150&fit=crop',
    lastMessage: 'Absolutely! They are packed and ready. Sounds good! See you soon!',
    timeAgo: '2 hours ago',
    lastMessageTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    messages: [
      {
        id: 'm3',
        senderId: 'user-1',
        text: "Hello Mrs. Jones, we are excited about the upcoming Resource Network. We've finalized the list of students who will be receiving supplies. Could you confirm if the 171 notebooks are ready for drop off?",
        timestamp: '5:15 AM',
        isSuggestedTime: true,
        suggestedTimes: ['Tue, 03/11/26: 2:00 PM', 'Tue, 03/11/26: 3:00 PM', 'Thu, 03/13/26: 2:00 PM']
      },
      {
        id: 'm4',
        senderId: 'np-4',
        text: "Absolutely! They are packed and ready. Sounds good! See you soon!",
        timestamp: '5:47 AM',
        confirmedTime: 'Tue, 03/11/26: 2:00 PM'
      }
    ]
  },
  {
    id: 'chat-3',
    participantName: 'Hope Feeling Foundation',
    participantTitle: 'Director Sarah Wilson',
    participantAvatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&h=150&fit=crop',
    lastMessage: 'We have the textbooks ready.',
    timeAgo: '3 hours ago',
    lastMessageTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    messages: []
  },
  {
    id: 'chat-4',
    participantName: "The Woman's Shelter",
    participantTitle: 'Coordinator Maria Garcia',
    participantAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150&h=150&fit=crop',
    lastMessage: 'Looking forward to the backpack drive.',
    timeAgo: '5 hours ago',
    lastMessageTimestamp: Date.now() - 5 * 60 * 60 * 1000,
    messages: []
  },
  {
    id: 'chat-5',
    participantName: 'Youth Outreach',
    participantTitle: 'Mr. David Chen',
    participantAvatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&h=150&fit=crop',
    lastMessage: "Could you confirm if the 150 Mathematics Textbooks are ready for drop off?",
    timeAgo: '1 hour ago',
    lastMessageTimestamp: Date.now() - 1 * 60 * 60 * 1000,
    messages: [
      {
        id: 'm5',
        senderId: 'user-1',
        text: "Hello Mr. Chen, we are excited about the upcoming Youth Outreach. We've finalized the list of students who will be receiving supplies. Could you confirm if the 150 Mathematics Textbooks are ready for drop off?",
        timestamp: '6:30 AM',
        isSuggestedTime: true,
        suggestedTimes: ['Mon, 03/10/26: 9:00 AM', 'Mon, 03/10/26: 10:00 AM', 'Wed, 03/12/26: 9:00 AM']
      }
    ]
  },
  {
    id: 'chat-6',
    participantName: 'Youth Empowerment Fund',
    participantTitle: 'Alex Rivera',
    participantAvatar: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&h=150&fit=crop',
    lastMessage: 'Art supplies are in stock.',
    timeAgo: '10 mins ago',
    lastMessageTimestamp: Date.now() - 10 * 60 * 1000,
    messages: []
  }
];
