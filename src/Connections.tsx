import React, { useState } from 'react';
import { 
  Search, Plus, Check, X, MessageSquare, 
  Filter, ChevronDown, MapPin, Package,
  Utensils, Shirt, Book, Library, Laptop, Home, Palette, Backpack
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MOCK_CONNECTIONS, MOCK_CHATS } from './mockData';
import { ConnectionRequest, Document, User, Chat } from './types';

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
  
  // Form state for new request
  const [newRequestPartner, setNewRequestPartner] = useState('');
  const [newRequestItem, setNewRequestItem] = useState('');
  const [newRequestQuantity, setNewRequestQuantity] = useState('');
  const [newRequestDetails, setNewRequestDetails] = useState('');

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
    if (!newRequestPartner || !newRequestItem || !newRequestQuantity) return;

    const partner = connections.find(c => c.fromName === newRequestPartner);
    const newRequest: ConnectionRequest = {
      id: `sent-${Date.now()}`,
      fromId: 'user-1',
      fromName: newRequestPartner,
      fromAvatar: partner?.fromAvatar || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&h=150&fit=crop',
      type: 'sent',
      status: 'pending',
      item: newRequestItem,
      quantity: parseInt(newRequestQuantity),
      distance: partner?.distance || '1 mi away',
      timeAgo: 'Just now',
      timestamp: Date.now(),
      description: newRequestDetails,
      availability: partner?.availability
    };

    setConnections(prev => [newRequest, ...prev]);
    setShowCreateRequest(false);
    setActiveTab('sent');
    
    // Reset form
    setNewRequestPartner('');
    setNewRequestItem('');
    setNewRequestQuantity('');
    setNewRequestDetails('');
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

  const approvedConnections = connections
    .filter(c => {
      const matchesSearch = c.fromName.toLowerCase().includes(directorySearchQuery.toLowerCase()) || 
                           c.item.toLowerCase().includes(directorySearchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || c.item.toLowerCase().includes(filterCategory.toLowerCase());
      return c.status === 'approved' && matchesSearch && matchesCategory;
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Your Connections</h1>
        <p className="text-slate-500">View and manage connections and requests.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Requests */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-dark">Current Requests</h2>
              <button 
                onClick={() => setShowCreateRequest(true)}
                className="flex items-center gap-2 text-brand-primary font-bold text-sm hover:underline"
              >
                <Plus size={18} />
                Create a Request
              </button>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('received')}
                className={cn(
                  "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                  activeTab === 'received' ? "bg-white shadow-sm text-brand-primary" : "text-slate-500"
                )}
              >
                Received ({receivedCount})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={cn(
                  "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                  activeTab === 'sent' ? "bg-white shadow-sm text-brand-primary" : "text-slate-500"
                )}
              >
                Sent ({sentCount})
              </button>
            </div>

            <div className="space-y-4">
              {filteredRequests.map((conn) => (
                <div key={conn.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex gap-3 mb-4">
                    <img src={conn.fromAvatar} alt={conn.fromName} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-brand-dark">{conn.fromName}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-black text-[10px] font-medium opacity-50">Pending</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{conn.timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          {React.cloneElement(getSupplyIcon(conn.item) as React.ReactElement, { size: 12 })}
                          {conn.quantity} {conn.item}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
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
                          className="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all"
                        >
                          <Check size={14} className="text-green-500" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleDeny(conn.id)}
                          className="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          <X size={14} className="text-red-500" />
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm text-center px-4">
                  There are no current connection requests.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Directory/Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Find for next connections..."
                    value={directorySearchQuery}
                    onChange={(e) => setDirectorySearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <Filter size={18} className="text-brand-primary" />
                    Filter
                    {filterCategory !== 'all' && (
                      <span className="w-2 h-2 bg-brand-primary rounded-full" />
                    )}
                  </button>
                  <div className="relative min-w-[140px]">
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-sm font-bold text-slate-700"
                    >
                      <option value="latest">Sort: Latest</option>
                      <option value="location">Sort: Location</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                {approvedConnections.map((conn) => (
                  <div key={conn.id} className="p-6 rounded-xl border border-slate-100 hover:border-brand-primary/20 transition-all flex flex-col sm:flex-row gap-6">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={conn.fromAvatar} alt={conn.fromName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-brand-dark text-lg">{conn.fromName}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-green-50/40 text-green-700 text-[10px] font-medium">Approved</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">{conn.description || 'Our goal is to help our young community have the resources they need to succeed.'}</p>
                      <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-2">
                          {getSupplyIcon(conn.item)}
                          {conn.quantity} {conn.item}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin size={16} className="text-brand-primary" />
                          {conn.distance}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <span className="text-xs text-slate-400">{conn.timeAgo}</span>
                      <button 
                        onClick={() => handleMessageWithDraft(conn)}
                        className="flex items-center gap-2 text-brand-primary font-bold text-sm group mt-4"
                      >
                        <div className="flex items-center gap-2 border-b border-transparent group-hover:border-brand-primary pb-0.5 transition-all">
                          <MessageSquare size={18} />
                          Message
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
                
                {directorySearchQuery && approvedConnections.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                    <p>No connections found</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
              <p className="text-xs text-slate-400">{approvedConnections.length} of {connections.filter(c => c.status === 'approved').length} Connections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-dark">Filter Connections</h3>
                <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-4">Supply Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['all', 'food', 'backpack', 'textbook', 'notebook', 'art'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterCategory(type)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize",
                          filterCategory === type 
                            ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-brand-primary/30"
                        )}
                      >
                        {type === 'all' ? 'All Supplies' : type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-4">
                <button 
                  onClick={() => setFilterCategory('all')}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/20"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Request Modal */}
      <AnimatePresence>
        {showCreateRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateRequest(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <button onClick={() => setShowCreateRequest(false)} className="text-brand-primary text-sm font-bold flex items-center gap-2 mb-1 hover:underline">
                    <ChevronDown className="rotate-90" size={16} />
                    Back to Connections
                  </button>
                  <h3 className="text-xl font-bold text-brand-dark">Create a Request</h3>
                  <p className="text-xs text-slate-500">Request supplies from community partners</p>
                </div>
                <button onClick={() => setShowCreateRequest(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Community Partner Name*</label>
                  <div className="relative">
                    <select 
                      value={newRequestPartner}
                      onChange={(e) => setNewRequestPartner(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    >
                      <option value="">Select a community partner...</option>
                      {connections.filter(c => c.status === 'approved').map(conn => (
                        <option key={conn.id} value={conn.fromName}>{conn.fromName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Item Needed*</label>
                  <div className="relative">
                    <select 
                      value={newRequestItem}
                      onChange={(e) => setNewRequestItem(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    >
                      <option value="">Select an item type...</option>
                      <option value="hygiene">Hygiene</option>
                      <option value="nonperishable food">Nonperishable Food</option>
                      <option value="school supplies">School Supplies</option>
                      <option value="hair care">Hair Care</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                  <input type="text" placeholder="Biology" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity*</label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    value={newRequestQuantity}
                    onChange={(e) => setNewRequestQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Additional Details</label>
                  <textarea 
                    placeholder="Specify other important details here..." 
                    value={newRequestDetails}
                    onChange={(e) => setNewRequestDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[100px] text-sm" 
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex justify-end gap-4">
                <button onClick={() => setShowCreateRequest(false)} className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all">Cancel</button>
                <button 
                  onClick={handleSubmitRequest}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-brand-primary/20"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
