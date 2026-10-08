import { ConnectionRequest, Document, Chat } from './types';

export const MOCK_USER = {
  id: 'user-1',
  name: 'Midland Elementary School',
  type: 'school' as const,
  email: 'midland@school.edu',
  avatar: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop',
  location: 'Midland, Ohio',
  contactName: 'Jane Doe',
  contactRole: 'Resource Coordinator',
  phone: '(555) 342-8921',
  about: 'Serving over 600 students with dedicated programs in literacy, STEM education, and essential family support services.',
  availability: [
    { day: 'MON', slots: ['8:00 AM', '9:00 AM', '10:00 AM'] },
    { day: 'TUES', slots: ['11:00 AM'] },
    { day: 'WED', slots: ['8:00 AM', '9:00 AM', '10:00 AM'] },
    { day: 'THURS', slots: ['11:00 AM'] },
    { day: 'FRI', slots: [] },
  ],
  dropOffLocation: 'Main Entrance, Reception Desk',
  dropOffDetails: 'Check in at main office desk or delivery dock door #3.',
  teamEmails: ['admin@school.edu', 'resource-team@school.edu']
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
    availableUntil: '3 days',
    schoolRequestData: {
      id: 'req-midland-fall-2026',
      submittedAt: 'Aug 18, 2026',
      schoolName: 'Midland Public Schools',
      contactName: 'Jane Doe',
      contactRole: 'Resource Coordinator',
      email: 'midland@school.edu',
      phone: '(555) 234-5678',
      state: 'Ohio',
      requestScope: 'school',
      schoolStudentsCount: 520,
      expectedStudentsInNeed: 140,
      selectedCategories: ['Backpacks', 'School Supplies', 'Hygiene Products'],
      backpacks: {
        gradeBands: ['Kindergarten - 2nd Grade', '3rd - 5th Grade'],
        solidQty: 90,
        clearQty: 50,
        mandateStatus: 'No mandate'
      },
      schoolSupplies: {
        packagedKits: true,
        kitPackagingPreference: 'Pre-packed inside backpacks',
        items: {
          'Wide-Ruled Spiral Notebooks': 120,
          'No. 2 Wood Pencils (12-pk)': 140,
          '24-Pack Crayola Crayons': 100,
          'Glue Sticks': 160,
          'Over-Ear Student Headphones': 60
        },
        deliveryMethod: 'Packed inside backpacks for back-to-school kickoff'
      },
      hygiene: {
        items: {
          'Deodorant (Stick/Spray)': 100,
          'Toothbrush & Toothpaste Kits': 120,
          'Pocket Hand Sanitizers': 140
        },
        sprayDeodorant: true,
        stickDeodorant: true,
        pads: true,
        tampons: false,
        gradeBands: ['3rd - 5th Grade', 'Middle School']
      },
      logistics: {
        method: 'Realize to Act volunteer drop-off direct to school',
        eventDate: 'August 24th, 9:00 AM',
        specialInstructions: 'Main Entrance, Reception Desk. Ask for Jane Doe.'
      }
    }
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
    name: 'Community Food Bank & Pantry',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=150&h=150&fit=crop',
    location: 'Downtown Midland',
    distance: '1.2 mi away',
    distanceValue: 1.2,
    description: 'Providing weekend student snack bags, nutritious non-perishables, and family food boxes to local school communities.',
    category: 'food',
    tags: ['Food & Nutrition', 'Weekend Snack Packs', 'Shelf-Stable Meals'],
    quantity: 500,
    postedAt: '1 day ago',
    availableUntil: '3 days'
  },
  {
    id: 'search-2',
    name: 'Tech for All Digital Access',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=150&h=150&fit=crop',
    location: 'University Circle',
    distance: '3.5 mi away',
    distanceValue: 3.5,
    description: 'Bridging the digital divide with refurbished student Chromebooks, charging accessories, and learning tablets for underserved classrooms.',
    category: 'technology',
    tags: ['Technology & Devices', 'Chromebooks', 'Tablets'],
    quantity: 35,
    postedAt: '4 hours ago',
    availableUntil: '1 week'
  },
  {
    id: 'search-3',
    name: 'Clean Start Hygiene Initiative',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&h=150&fit=crop',
    location: 'West Side',
    distance: '2.8 mi away',
    distanceValue: 2.8,
    description: 'Supporting youth dignity with deodorant packs, menstrual care kits, toothbrush sets, and pocket hygiene care.',
    category: 'hygiene',
    tags: ['Hygiene & Personal Care', 'Deodorant', 'Menstrual Care'],
    quantity: 180,
    postedAt: '6 hours ago',
    availableUntil: '5 days'
  },
  {
    id: 'search-4',
    name: 'Scholastic & Literacy Partners',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&h=150&fit=crop',
    location: 'East Midland',
    distance: '4.1 mi away',
    distanceValue: 4.1,
    description: 'Empowering early literacy with grade-band leveled readers, diverse chapter books, and classroom library book packs.',
    category: 'books',
    tags: ['Books & Literacy', 'Early Readers (K-2)', 'Chapter Books'],
    quantity: 300,
    postedAt: '2 days ago',
    availableUntil: '2 weeks'
  },
  {
    id: 'search-5',
    name: 'Pack The Future Alliance',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=150&h=150&fit=crop',
    location: 'North Midland',
    distance: '1.8 mi away',
    distanceValue: 1.8,
    description: 'Supplying heavy-duty solid color backpacks and clear transparent backpacks tailored to district security mandates.',
    category: 'backpacks',
    tags: ['Backpacks', 'Solid Color', 'Clear Transparent'],
    quantity: 250,
    postedAt: '5 hours ago',
    availableUntil: '10 days'
  },
  {
    id: 'search-6',
    name: 'Classroom Essentials Network',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&h=150&fit=crop',
    location: 'Midland Civic Center',
    distance: '2.1 mi away',
    distanceValue: 2.1,
    description: 'Distributing individually pre-packaged school supply kits, wide-ruled notebooks, pencils, crayons, and student headphones.',
    category: 'school-supplies',
    tags: ['School Supplies', 'Individually Packaged Kits', 'Notebooks'],
    quantity: 400,
    postedAt: '3 hours ago',
    availableUntil: '2 weeks'
  },
  {
    id: 'search-7',
    name: 'Warmth & Wear Student Clothing',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=150&h=150&fit=crop',
    location: 'South District',
    distance: '3.2 mi away',
    distanceValue: 3.2,
    description: 'Dedicated to keeping students warm with winter coats, hoodies, clean socks, and standard uniform polo shirts.',
    category: 'clothing',
    tags: ['Clothing & Apparel', 'Winter Coats', 'Hoodies'],
    quantity: 120,
    postedAt: '1 day ago',
    availableUntil: '1 week'
  },
  {
    id: 'search-8',
    name: 'Safe & Clean School Environments',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=150&h=150&fit=crop',
    location: 'Industrial Park',
    distance: '4.8 mi away',
    distanceValue: 4.8,
    description: 'Providing schools with disinfectant wipes, classroom hand sanitizer pump jugs, and paper towel multi-packs.',
    category: 'cleaning',
    tags: ['Cleaning Supplies', 'Disinfecting Wipes', 'Sanitizer Jugs'],
    quantity: 160,
    postedAt: '12 hours ago',
    availableUntil: '6 days'
  },
  {
    id: 'search-9',
    name: 'NextGen STEM & Creative Arts',
    type: 'partner',
    avatar: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&h=150&fit=crop',
    location: 'Tech District',
    distance: '2.5 mi away',
    distanceValue: 2.5,
    description: 'Inspiring future innovators through hands-on STEM experiment kits, Time for Kids magazines, and art materials.',
    category: 'stem',
    tags: ['STEM & Enrichment', 'STEM Kits', 'Art Materials'],
    quantity: 85,
    postedAt: '1 day ago',
    availableUntil: '2 weeks'
  }
];

export const MOCK_SUGGESTED_MATCHES = [
  {
    id: 'suggest-1',
    name: 'Pack The Future Alliance',
    avatar: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=150&h=150&fit=crop',
    description: 'Ready to fulfill elementary solid color and clear transparent backpack requests.',
    category: 'backpacks',
    tags: ['Backpacks', 'Solid Color'],
    item: 'Backpacks',
    quantity: 250,
    distance: '1.8 mi away'
  },
  {
    id: 'suggest-2',
    name: 'Community Food Bank & Pantry',
    avatar: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=150&h=150&fit=crop',
    description: 'Weekend student snack bags and shelf-stable nutritional packs.',
    category: 'food',
    tags: ['Food & Nutrition', 'Weekend Snack Packs'],
    item: 'Nutrition Packs',
    quantity: 500,
    distance: '1.2 mi away'
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
