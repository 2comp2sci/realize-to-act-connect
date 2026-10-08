import React, { useState } from 'react';
import { 
  Search, Plus, Check, X, MessageSquare, 
  Filter, ChevronDown, MapPin, Package,
  Utensils, Shirt, Book, Library, Laptop, Home, Palette, Backpack,
  Send, Calendar, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MOCK_CONNECTIONS, MOCK_CHATS } from './mockData';
import { ConnectionRequest, Document, User, Chat } from './types';
import Tag, { getCategoryIcon } from './components/Tag';
import { RESOURCE_CATEGORIES } from './data/categories';

interface ConnectionsProps {
  connections: ConnectionRequest[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionRequest[]>>;
  onNavigateToChat: (chatId: string) => void;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setDraftMessage: (msg: { text: string; isSuggestedTime?: boolean; suggestedTimes?: string[]; meetingNote?: string } | null) => void;
  user: User;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export default function Connections({ connections, setConnections, onNavigateToChat, setDocuments, setDraftMessage, user, chats, setChats }: ConnectionsProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'location'>('latest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubcategory, setFilterSubcategory] = useState('all');
  
  // Form state for deep request matching Search depth
  const [newRequestPartner, setNewRequestPartner] = useState('');
  const [newRequestCategory, setNewRequestCategory] = useState('backpacks');
  const [newRequestSubcategories, setNewRequestSubcategories] = useState<string[]>([]);
  const [newRequestQuantity, setNewRequestQuantity] = useState('100');
  const [newRequestDetails, setNewRequestDetails] = useState('');
  const [newRequestGradeBand, setNewRequestGradeBand] = useState('All Elementary (K-5)');
  const [newRequestError, setNewRequestError] = useState('');

  const handleApprove = (id: string) => {
    const connection = connections.find(c => c.id === id);
    if (connection) {
      const now = Date.now();
      
      // Generate initial message with suggested times
      const userAvailability = user.availability || [];
      const partnerAvailability = connection.availability || [];
      const overlapping: string[] = [];
      
      userAvailability.forEach(uDay => {
        const pDay = partnerAvailability.find(p => p.day === uDay.day);
        if (pDay) {
          const commonSlots = uDay.slots.filter(slot => pDay.slots.includes(slot));
          commonSlots.forEach(slot => {
            const dayFormatted = uDay.day.charAt(0).toUpperCase() + uDay.day.slice(1).toLowerCase();
            overlapping.push(`${dayFormatted}, 03/10/26: ${slot}`);
          });
        }
      });

      const intro = `Hi ${connection.fromName}, are the ${connection.quantity} ${connection.item} still available? We'd love to coordinate a drop off!`;
      const fullText = `${intro} Based on our profiles, we both have availability during these times. Would any of these work for you?`;

      const initialMessage = {
        id: `m-init-${Date.now()}`,
        senderId: 'user-1',
        text: fullText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSuggestedTime: overlapping.length > 0,
        suggestedTimes: overlapping.length > 0 ? overlapping : undefined
      };

      setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'approved', isNew: false, timestamp: now } : c));
      
      // Update chat's lastMessageTimestamp and add the initial message so it jumps to the top and shows in sidebar
      setChats(prev => prev.map(chat => {
        if (chat.participantName === connection.fromName) {
          const isDraftOnly = connection.fromName === 'Hope Feeling Foundation' || connection.fromName === "The Woman's Shelter";
          
          return { 
            ...chat, 
            lastMessageTimestamp: now,
            lastMessage: isDraftOnly ? undefined : fullText,
            timeAgo: 'Just now',
            messages: isDraftOnly ? [] : [initialMessage],
            isRecentlyApproved: true // Flag to show in sidebar even without messages
          };
        }
        return chat;
      }));
      
      // Add to pending signatures
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        title: `Letter of Acknowledgement - ${connection.fromName}`,
        fromName: connection.fromName,
        toName: 'Cleveland Elementary School',
        status: 'pending',
        dueDate: 'Due in 7 days',
        timeAgo: 'Just now',
        itemDescription: `approved ${connection.quantity} ${connection.item}`,
      };
      setDocuments(prev => [newDoc, ...prev]);
    }
  };

  const handleDeny = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmitRequest = () => {
    const qty = parseInt(newRequestQuantity);
    if (!newRequestPartner) {
      setNewRequestError('Please select a community partner.');
      return;
    }
    if (!qty || qty <= 0) {
      setNewRequestError('Please specify a valid quantity needed.');
      return;
    }

    const partner = connections.find(c => c.fromName === newRequestPartner);
    const catDef = RESOURCE_CATEGORIES.find(c => c.id === newRequestCategory) || RESOURCE_CATEGORIES[0];
    const itemTitle = newRequestSubcategories.length > 0 
      ? `${catDef.label} (${newRequestSubcategories.join(', ')})` 
      : catDef.label;

    const newRequest: ConnectionRequest = {
      id: `sent-${Date.now()}`,
      fromId: 'user-1',
      fromName: newRequestPartner,
      fromAvatar: partner?.fromAvatar || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&h=150&fit=crop',
      type: 'sent',
      status: 'pending',
      item: itemTitle,
      quantity: qty,
      distance: partner?.distance || 'Midland, MI',
      timeAgo: 'Just now',
      timestamp: Date.now(),
      description: newRequestDetails.trim() || `Request for ${qty} units of ${catDef.label} (${newRequestGradeBand}).`,
      availability: partner?.availability,
      schoolRequestData: {
        schoolName: user?.name || 'Midland Public Schools',
        contactName: user?.contactPerson || 'Jane Doe',
        contactRole: user?.role || 'Resource Coordinator',
        email: user?.email || 'coordinator@school.edu',
        phone: user?.phone || '(555) 342-8921',
        state: 'Michigan',
        requestScope: 'district',
        expectedStudentsInNeed: qty,
        selectedCategories: [catDef.label, ...newRequestSubcategories],
        logistics: {
          method: 'Realize to Act volunteer or partner drop-off direct to school facility',
          eventDate: 'Scheduled school distribution event',
          specialInstructions: newRequestDetails.trim() || 'Deliver to main office entrance reception or Door #2.'
        }
      }
    };

    setConnections(prev => [newRequest, ...prev]);
    setShowCreateRequest(false);
    setActiveTab('sent');
    
    // Reset form
    setNewRequestPartner('');
    setNewRequestSubcategories([]);
    setNewRequestQuantity('100');
    setNewRequestDetails('');
    setNewRequestError('');
  };

  const getSupplyIcon = (item: string) => {
    const lowerItem = item.toLowerCase();
    if (lowerItem.includes('food') || lowerItem.includes('meal')) return <Utensils size={16} className="text-brand-primary" />;
    if (lowerItem.includes('backpack')) return <Backpack size={16} className="text-brand-primary" />;
    if (lowerItem.includes('clothing') || lowerItem.includes('shirt')) return <Shirt size={16} className="text-brand-primary" />;
    if (lowerItem.includes('book') || lowerItem.includes('textbook')) return <Book size={16} className="text-brand-primary" />;
    if (lowerItem.includes('library') || lowerItem.includes('school')) return <Library size={16} className="text-brand-primary" />;
    if (lowerItem.includes('tech') || lowerItem.includes('laptop') || lowerItem.includes('computer')) return <Laptop size={16} className="text-brand-primary" />;
    if (lowerItem.includes('furniture') || lowerItem.includes('chair') || lowerItem.includes('desk')) return <Home size={16} className="text-brand-primary" />;
    if (lowerItem.includes('art') || lowerItem.includes('paint') || lowerItem.includes('supply')) return <Palette size={16} className="text-brand-primary" />;
    return <Package size={16} className="text-brand-primary" />;
  };

  const handleMessageWithDraft = (conn: ConnectionRequest) => {
    const chat = chats.find(c => c.participantName === conn.fromName);
    
    // Only show draft for new connections (except Hope Feeling Foundation which always shows suggested times)
    if (!conn.isNew && conn.fromName !== 'Hope Feeling Foundation') {
      onNavigateToChat(chat?.id || chats[0].id);
      return;
    }
    
    const userAvailability = user.availability || [];
    const partnerAvailability = conn.availability || [];

    // Find overlapping times
    const overlapping: string[] = [];
    userAvailability.forEach(uDay => {
      const pDay = partnerAvailability.find(p => p.day === uDay.day);
      if (pDay) {
        const commonSlots = uDay.slots.filter(slot => pDay.slots.includes(slot));
        if (commonSlots.length > 0) {
          commonSlots.forEach(slot => {
            const dayFormatted = uDay.day.charAt(0).toUpperCase() + uDay.day.slice(1).toLowerCase();
            overlapping.push(`${dayFormatted}, 03/10/26: ${slot}`);
          });
        }
      }
    });

    const quantity = conn.quantity;
    const item = conn.item;
    const dropOffLoc = user.dropOffLocation ? ` at ${user.dropOffLocation}` : '';
    
    let intro = `Hi ${conn.fromName}, are the ${quantity} ${item} still available? If so, we'd love to coordinate a drop off${dropOffLoc}.`;
    
    if (quantity >= 150) {
      intro = `Hi ${conn.fromName}, are the ${quantity} ${item} still available? We'd love to coordinate a drop off${dropOffLoc} for this incredibly generous donation!`;
    } else if (quantity >= 50) {
      intro = `Hi ${conn.fromName}, are the ${quantity} ${item} still available? We'd like to coordinate a drop off${dropOffLoc} if they are.`;
    }

    const draftText = `${intro} Based on our profiles, we both have availability during these times. Would any of these work for you?`;

    // Only set draft for specific scenarios, others should be empty as per request
    if (conn.fromName === 'Network Center') {
      setDraftMessage({
        text: "Great, thank you! Since the time is confirmed for 2:00 PM, let's meet at the Main Entrance. I'll have a few staff members there to help unload.",
        isSuggestedTime: false,
        meetingNote: 'Main Entrance'
      });
    } else if (conn.fromName !== 'Youth Outreach' && conn.fromName !== 'Leader of Tomorrow Non-Profit') {
      setDraftMessage({
        text: draftText,
        isSuggestedTime: overlapping.length > 0,
        suggestedTimes: overlapping.length > 0 ? overlapping : undefined
      });
    } else {
      setDraftMessage(null);
    }

    // Mark as no longer new after generating the draft
    setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, isNew: false } : c));
    
    onNavigateToChat(chat?.id || chats[0].id);
  };

  const filteredRequests = connections.filter(c => {
    const matchesTab = activeTab === 'received' ? c.type === 'received' : c.type === 'sent';
    return matchesTab && c.status === 'pending';
  });

  const activeFilterCategoryDef = RESOURCE_CATEGORIES.find(c => c.id === filterCategory);
  const activeRequestCategoryDef = RESOURCE_CATEGORIES.find(c => c.id === newRequestCategory) || RESOURCE_CATEGORIES[0];

  const approvedConnections = connections
    .filter(c => {
      const q = directorySearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.fromName.toLowerCase().includes(q) || 
        c.item.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      let matchesCategory = true;
      if (filterCategory !== 'all') {
        const catDef = RESOURCE_CATEGORIES.find(cat => cat.id === filterCategory);
        matchesCategory = c.item.toLowerCase().includes(filterCategory.toLowerCase()) ||
          (catDef && c.item.toLowerCase().includes(catDef.label.toLowerCase())) ||
          (catDef && catDef.subcategories.some(sc => c.item.toLowerCase().includes(sc.label.toLowerCase()))) ||
          (c.schoolRequestData?.selectedCategories?.some(cat => 
            cat.toLowerCase().includes(catDef?.label.toLowerCase() || '')
          ) ?? false);
      }

      let matchesSubcategory = true;
      if (filterSubcategory !== 'all' && activeFilterCategoryDef) {
        const subcatDef = activeFilterCategoryDef.subcategories.find(sc => sc.id === filterSubcategory);
        if (subcatDef) {
          matchesSubcategory = c.item.toLowerCase().includes(subcatDef.label.toLowerCase()) ||
            (c.schoolRequestData?.selectedCategories?.some(cat => 
              cat.toLowerCase().includes(subcatDef.label.toLowerCase())
            ) ?? false);
        }
      }

      return c.status === 'approved' && matchesSearch && matchesCategory && matchesSubcategory;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return b.timestamp - a.timestamp;
      if (sortBy === 'location') {
        const distA = parseFloat(a.distance) || 0;
        const distB = parseFloat(b.distance) || 0;
        return distA - distB;
      }
      return 0;
    });

  const receivedCount = connections.filter(c => c.type === 'received' && c.status === 'pending').length;
  const sentCount = connections.filter(c => c.type === 'sent' && c.status === 'pending').length;

  const getCategoryCount = (catId: string) => {
    const approved = connections.filter(c => c.status === 'approved');
    if (catId === 'all') return approved.length;
    const catDef = RESOURCE_CATEGORIES.find(c => c.id === catId);
    if (!catDef) return 0;
    return approved.filter(c => {
      return c.item.toLowerCase().includes(catId.toLowerCase()) ||
        c.item.toLowerCase().includes(catDef.label.toLowerCase()) ||
        catDef.subcategories.some(sc => c.item.toLowerCase().includes(sc.label.toLowerCase())) ||
        (c.schoolRequestData?.selectedCategories?.some(cat => 
          cat.toLowerCase().includes(catDef.label.toLowerCase())
        ) ?? false);
    }).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Your Connections</h1>
        <p className="text-slate-500">View and manage connections and requests.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Requests */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[6px] p-6 shadow-xs border border-slate-200/80">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-dark">Current Requests</h2>
              <button 
                onClick={() => setShowCreateRequest(true)}
                className="flex items-center gap-1.5 text-brand-primary font-bold text-xs hover:underline cursor-pointer"
              >
                <Plus size={16} />
                <span>Create a Request</span>
              </button>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-[5px] mb-6">
              <button
                onClick={() => setActiveTab('received')}
                className={cn(
                  "flex-1 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer",
                  activeTab === 'received' ? "bg-white shadow-xs text-brand-primary" : "text-slate-500 hover:text-slate-800"
                )}
              >
                Received ({receivedCount})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={cn(
                  "flex-1 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer",
                  activeTab === 'sent' ? "bg-white shadow-xs text-brand-primary" : "text-slate-500 hover:text-slate-800"
                )}
              >
                Sent ({sentCount})
              </button>
            </div>

            <div className="space-y-4">
              {filteredRequests.map((conn) => (
                <div key={conn.id} className="p-4 rounded-[6px] border border-slate-200/80 bg-slate-50/50">
                  <div className="flex gap-3 mb-4">
                    <img src={conn.fromAvatar} alt={conn.fromName} className="w-12 h-12 rounded-[5px] object-cover border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-brand-dark truncate">{conn.fromName}</h3>
                          <Tag label={conn.status} variant="status-pending" size="sm" />
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{conn.timeAgo}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Tag label={`${conn.quantity} ${conn.item}`} variant="category" size="sm" />
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <MapPin size={12} className="text-brand-primary" />
                          {conn.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {conn.type === 'received' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleApprove(conn.id)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[5px] bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold transition-all shadow-none cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => handleDeny(conn.id)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[5px] border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50/60 text-xs font-semibold transition-all shadow-none cursor-pointer"
                        >
                          <X size={14} />
                          <span>Deny</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-[5px] text-slate-400 text-xs text-center px-4">
                  There are no current connection requests.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Directory/Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[6px] p-6 sm:p-8 shadow-xs border border-slate-200/80 min-h-[600px] flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* Search, Filter & Sort Controls */}
              <div className="space-y-3 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Find verified community connections by name or supplies..."
                      value={directorySearchQuery}
                      onChange={(e) => setDirectorySearchQuery(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm text-slate-800"
                    />
                    {directorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDirectorySearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => setShowFilterModal(true)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer shadow-none",
                        filterCategory !== 'all' || filterSubcategory !== 'all'
                          ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      )}
                    >
                      <Filter size={14} className={filterCategory !== 'all' || filterSubcategory !== 'all' ? "text-brand-primary" : "text-slate-500"} />
                      <span>Filters</span>
                      {(filterCategory !== 'all' || filterSubcategory !== 'all') && (
                        <span className="px-1.5 py-0.2 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                          {filterSubcategory !== 'all' ? '2' : '1'}
                        </span>
                      )}
                    </button>
                    <div className="relative min-w-[140px]">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full pl-3 pr-8 py-2.5 rounded-[5px] border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="latest">Sort: Latest</option>
                        <option value="location">Sort: Nearest</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quick Inline Category Selector for instant, readable filtering */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCategory('all');
                      setFilterSubcategory('all');
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-[4px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer shrink-0",
                      filterCategory === 'all'
                        ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <span>All Supplies</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded",
                      filterCategory === 'all' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    )}>
                      {getCategoryCount('all')}
                    </span>
                  </button>

                  {RESOURCE_CATEGORIES.map(cat => {
                    const isSelected = filterCategory === cat.id;
                    const count = getCategoryCount(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFilterCategory(cat.id);
                          setFilterSubcategory('all');
                        }}
                        className={cn(
                          "px-2.5 py-1.5 rounded-[4px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer shrink-0",
                          isSelected
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <span>{cat.label}</span>
                        {count > 0 && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.2 rounded",
                            isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Filter Chips Strip */}
                {(filterCategory !== 'all' || filterSubcategory !== 'all' || directorySearchQuery) && (
                  <div className="p-2.5 bg-brand-primary/5 rounded-[5px] border border-brand-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800">Filtered by:</span>
                      
                      {directorySearchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                          <span>Search: "{directorySearchQuery}"</span>
                          <button onClick={() => setDirectorySearchQuery('')} className="text-slate-400 hover:text-red-600 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      )}

                      {filterCategory !== 'all' && activeFilterCategoryDef && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-brand-primary/30 text-brand-primary font-bold">
                          <span>Category: {activeFilterCategoryDef.label}</span>
                          <button 
                            onClick={() => {
                              setFilterCategory('all');
                              setFilterSubcategory('all');
                            }} 
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}

                      {filterSubcategory !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                          <span>Item: {activeFilterCategoryDef?.subcategories.find(s => s.id === filterSubcategory)?.label || filterSubcategory}</span>
                          <button onClick={() => setFilterSubcategory('all')} className="text-slate-400 hover:text-red-600 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 ml-auto">
                      <span className="text-slate-600 font-medium">
                        <strong>{approvedConnections.length}</strong> {approvedConnections.length === 1 ? 'connection' : 'connections'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDirectorySearchQuery('');
                          setFilterCategory('all');
                          setFilterSubcategory('all');
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                {approvedConnections.map((conn) => (
                  <div key={conn.id} className="p-5 rounded-[6px] border border-slate-200/80 hover:border-brand-primary/30 transition-all flex flex-col sm:flex-row gap-5 bg-white">
                    <div className="w-16 h-16 rounded-[5px] overflow-hidden shrink-0 border border-slate-200">
                      <img src={conn.fromAvatar} alt={conn.fromName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-brand-dark text-base truncate">{conn.fromName}</h3>
                        <Tag label="Approved" variant="status-approved" size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                        {conn.description || 'Verified community partner dedicated to supporting classroom resources and school distribution programs.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag label={`${conn.quantity} ${conn.item}`} variant="category" size="sm" />
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <MapPin size={13} className="text-brand-primary" />
                          {conn.distance}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col justify-between items-end shrink-0 gap-2">
                      <span className="text-xs text-slate-400">{conn.timeAgo}</span>
                      <button 
                        onClick={() => handleMessageWithDraft(conn)}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 shadow-none cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {directorySearchQuery && approvedConnections.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                    <p className="text-xs">No matching verified connections found</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
              <span>Verified Community Directory</span>
              <span>{approvedConnections.length} of {connections.filter(c => c.status === 'approved').length} Connections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal with Category Depth */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative bg-white rounded-[6px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark">Filter Connections</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Filter by supply category and specific items.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowFilterModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      1. Category
                    </label>
                    {filterCategory !== 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterCategory('all');
                          setFilterSubcategory('all');
                        }}
                        className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
                      >
                        Reset to All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory('all');
                        setFilterSubcategory('all');
                      }}
                      className={cn(
                        "p-2.5 rounded-[5px] text-xs font-bold transition-all text-left border flex items-center justify-between cursor-pointer",
                        filterCategory === 'all' 
                          ? "bg-brand-primary text-white border-brand-primary shadow-xs" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Package size={14} className={filterCategory === 'all' ? "text-white" : "text-brand-primary"} />
                        <span>All Supplies</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        filterCategory === 'all' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        {getCategoryCount('all')}
                      </span>
                    </button>
                    {RESOURCE_CATEGORIES.map((cat) => {
                      const isSelected = filterCategory === cat.id;
                      const count = getCategoryCount(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFilterCategory(cat.id);
                            setFilterSubcategory('all');
                          }}
                          className={cn(
                            "p-2.5 rounded-[5px] text-xs font-bold transition-all text-left border flex items-center justify-between cursor-pointer",
                            isSelected 
                              ? "bg-brand-primary text-white border-brand-primary shadow-xs" 
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={isSelected ? "text-white" : "text-brand-primary"}>
                              {getCategoryIcon(cat.label, 14)}
                            </span>
                            <span className="truncate">{cat.label}</span>
                          </div>
                          {count > 0 && (
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1",
                              isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                            )}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategory Depth Selection */}
                {activeFilterCategoryDef && (
                  <div className="p-4 bg-brand-primary/5 rounded-[6px] border border-brand-primary/25 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                        2. Items ({activeFilterCategoryDef.label})
                      </label>
                      <button
                        type="button"
                        onClick={() => setFilterSubcategory('all')}
                        className="text-[11px] text-brand-primary font-bold hover:underline cursor-pointer"
                      >
                        Reset to All Items
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterSubcategory('all')}
                        className={cn(
                          "p-2.5 rounded-[4px] text-xs font-medium transition-all flex items-center justify-between border cursor-pointer",
                          filterSubcategory === 'all'
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-brand-primary/40"
                        )}
                      >
                        <span>All {activeFilterCategoryDef.label} Items</span>
                        {filterSubcategory === 'all' && <Check size={11} strokeWidth={3} />}
                      </button>
                      {activeFilterCategoryDef.subcategories.map(sc => {
                        const isSelected = filterSubcategory === sc.id;
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            onClick={() => setFilterSubcategory(sc.id)}
                            className={cn(
                              "p-2.5 rounded-[4px] text-xs font-medium transition-all flex items-center justify-between border cursor-pointer",
                              isSelected
                                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-brand-primary/40"
                            )}
                          >
                            <span>{sc.label}</span>
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterSubcategory('all');
                  }}
                  className="py-2.5 px-4 rounded-[5px] font-semibold text-xs text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-none"
                >
                  Reset All
                </button>
                <button 
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-xs transition-all cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Show {approvedConnections.length} Matching Connections</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Request Modal with the Same Level of Depth */}
      <AnimatePresence>
        {showCreateRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateRequest(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative bg-white rounded-[6px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/70">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary block">
                    Resource Dispatch Manifest
                  </span>
                  <h3 className="text-xl font-serif font-bold text-brand-dark mt-0.5">Send Request to Partner</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Specify required categories, itemized supplies, and student need.</p>
                </div>
                <button onClick={() => setShowCreateRequest(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {newRequestError && (
                  <div className="p-3 rounded-[5px] bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                    {newRequestError}
                  </div>
                )}

                {/* Partner Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Community Partner*
                  </label>
                  <div className="relative">
                    <select 
                      value={newRequestPartner}
                      onChange={(e) => {
                        setNewRequestPartner(e.target.value);
                        if (newRequestError) setNewRequestError('');
                      }}
                      className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-sm font-medium"
                    >
                      <option value="">Select a verified community partner...</option>
                      {connections.filter(c => c.status === 'approved').map(conn => (
                        <option key={conn.id} value={conn.fromName}>{conn.fromName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* 1. Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Category*
                  </label>
                  <div className="flex flex-wrap p-1 bg-slate-100 rounded-[5px] gap-1">
                    {RESOURCE_CATEGORIES.map(cat => {
                      const isSelected = newRequestCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setNewRequestCategory(cat.id);
                            setNewRequestSubcategories([]);
                            if (newRequestError) setNewRequestError('');
                          }}
                          className={cn(
                            "flex-1 min-w-[120px] py-2 px-2.5 rounded-[5px] text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
                            isSelected 
                              ? "bg-white text-brand-primary shadow-xs" 
                              : "text-slate-600 hover:text-slate-900"
                          )}
                        >
                          {getCategoryIcon(cat.label, 13)}
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Specific Items */}
                <div className="p-4 rounded-[5px] border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Items ({activeRequestCategoryDef.label})
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Select items</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeRequestCategoryDef.subcategories.map(subcat => {
                      const isChecked = newRequestSubcategories.includes(subcat.label);
                      return (
                        <button
                          key={subcat.id}
                          type="button"
                          onClick={() => {
                            setNewRequestSubcategories(prev => 
                              prev.includes(subcat.label)
                                ? prev.filter(s => s !== subcat.label)
                                : [...prev, subcat.label]
                            );
                          }}
                          className={cn(
                            "p-2.5 rounded-[5px] border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer",
                            isChecked
                              ? "bg-white border-brand-primary text-brand-primary shadow-xs"
                              : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white"
                          )}
                        >
                          <span>{subcat.label}</span>
                          <span className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center text-[10px]",
                            isChecked ? "bg-brand-primary border-brand-primary text-white" : "border-slate-300"
                          )}>
                            {isChecked && <Check size={11} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Grade Level */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    3. Grade Level
                  </label>
                  <div className="flex p-1 bg-slate-100 rounded-[5px] gap-1">
                    {['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'District-Wide'].map(band => (
                      <button
                        key={band}
                        type="button"
                        onClick={() => setNewRequestGradeBand(band)}
                        className={cn(
                          "flex-1 py-2 px-1 rounded-[5px] text-xs font-bold transition-all text-center cursor-pointer",
                          newRequestGradeBand === band
                            ? "bg-white text-brand-primary shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {band}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Quantity Needed */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    4. Quantity*
                  </label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    value={newRequestQuantity}
                    onChange={(e) => {
                      setNewRequestQuantity(e.target.value);
                      if (newRequestError) setNewRequestError('');
                    }}
                    className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>

                {/* 5. Delivery & Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    5. Delivery & Notes
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Delivery entrance or schedule notes..." 
                    value={newRequestDetails}
                    onChange={(e) => setNewRequestDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm leading-relaxed" 
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateRequest(false)} 
                  className="px-5 py-2.5 rounded-[5px] font-semibold text-xs text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-none"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmitRequest}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-xs transition-all cursor-pointer shadow-none flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Submit Request</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
