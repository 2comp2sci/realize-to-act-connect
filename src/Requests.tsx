import React, { useState } from 'react';
import { 
  Search, Check, X, MapPin, Package,
  Utensils, Shirt, Book, Library, Laptop, Home, Palette, Backpack,
  FileText, ArrowRight, Eye, CheckCircle2, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { ConnectionRequest, User } from './types';
import RequestDetailModal from './components/RequestDetailModal';
import Tag from './components/Tag';
import { respondToRequest, cancelRequest } from './lib/requests';
import { ensureChat } from './lib/chats';
import { connectOnApprovedRequest } from './lib/connections';

interface RequestsProps {
  connections: ConnectionRequest[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionRequest[]>>;
  user: User;
}

export default function Requests({ connections, setConnections, user }: RequestsProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestForModal, setSelectedRequestForModal] = useState<ConnectionRequest | null>(null);

  const handleApprove = async (id: string) => {
    const connection = connections.find(c => c.id === id);
    // Passing the current user as the "claim" attributes a broadcast
    // request (toUid == null) to whoever accepted it, so it stops showing
    // up as pending for every other partner. The Firestore onSnapshot
    // listener in App.tsx pushes the update back down into `connections`.
    await respondToRequest(id, 'approved', { uid: user.id, name: user.name, avatar: user.avatar || '' });

    // Open up a chat thread with the other party now that the request is approved.
    if (connection) {
      await ensureChat(
        user.id,
        { name: user.name, title: user.contactName || '', avatar: user.avatar },
        connection.fromId,
        { name: connection.fromName, title: '', avatar: connection.fromAvatar }
      );
      // Organizations that exchange resources are automatically connected.
      // A failure here shouldn't undo or block the approval itself.
      await connectOnApprovedRequest(
        { uid: user.id, name: user.name, avatar: user.avatar, type: user.type },
        { uid: connection.fromId, name: connection.fromName, avatar: connection.fromAvatar },
        id
      ).catch(err => console.error('Auto-connect failed', err));
    }
  };

  const handleDeny = async (id: string) => {
    const connection = connections.find(c => c.id === id);
    if (connection?.type === 'sent') {
      await cancelRequest(id);
    } else {
      await respondToRequest(id, 'denied');
    }
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

  const filteredRequests = connections.filter(c => {
    const matchesTab = activeTab === 'received' ? c.type === 'received' : c.type === 'sent';
    if (!matchesTab) return false;

    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesName = c.fromName.toLowerCase().includes(q);
      const matchesItem = c.item.toLowerCase().includes(q);
      const matchesDesc = c.description ? c.description.toLowerCase().includes(q) : false;
      return matchesName || matchesItem || matchesDesc;
    }

    return true;
  });

  const receivedCount = connections.filter(c => c.type === 'received' && c.status === 'pending').length;
  const sentCount = connections.filter(c => c.type === 'sent' && c.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header section dedicated solely to reviewing, approving, and canceling requests */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Request Management Center</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark mt-1">Requests Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and take action on incoming and outgoing supply requests across your educational network.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-white rounded-[6px] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Received vs Sent Tally Toggle - Mimicking the clean sign-in tally */}
        <div className="flex p-1 bg-slate-100 rounded-[5px] w-full">
          <button
            onClick={() => setActiveTab('received')}
            className={cn(
              "flex-1 py-2.5 rounded-[5px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === 'received' ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <span>Received Requests</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold",
              activeTab === 'received' ? "bg-brand-primary/15 text-brand-primary" : "bg-slate-200 text-slate-600"
            )}>
              {receivedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={cn(
              "flex-1 py-2.5 rounded-[5px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === 'sent' ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <span>Sent Requests</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold",
              activeTab === 'sent' ? "bg-brand-primary/15 text-brand-primary" : "bg-slate-200 text-slate-600"
            )}>
              {sentCount}
            </span>
          </button>
        </div>

        {/* Search & Status Filters Bar */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={`Search ${activeTab} requests by partner name, supply item, or notes...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex p-1 bg-slate-100 rounded-[5px] gap-1 shrink-0 w-full sm:w-auto">
              {[
                { id: 'pending', label: 'Needs Review' },
                { id: 'approved', label: 'Approved' },
                { id: 'all', label: 'All Requests' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id as any)}
                  className={cn(
                    "flex-1 sm:flex-initial px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all text-center cursor-pointer",
                    statusFilter === s.id
                      ? "bg-white text-brand-primary shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Strip if search is entered or non-default status */}
          {(searchQuery || statusFilter !== 'pending') && (
            <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-[5px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Showing:</span>
                <span className="font-bold text-slate-800">{filteredRequests.length} matching {filteredRequests.length === 1 ? 'request' : 'requests'}</span>
                {searchQuery && (
                  <span className="text-slate-500">for "{searchQuery}"</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('pending');
                }}
                className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Requests Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((conn) => (
            <div 
              key={conn.id} 
              className="p-6 rounded-[6px] border border-slate-200 bg-slate-50/40 hover:border-brand-primary/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4 mb-4">
                  <img 
                    src={conn.fromAvatar} 
                    alt={conn.fromName} 
                    className="w-14 h-14 rounded-[5px] object-cover border border-slate-200" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 truncate text-base">{conn.fromName}</h3>
                      <Tag 
                        label={conn.status} 
                        variant={conn.status === 'approved' ? 'status-approved' : conn.status === 'denied' ? 'status-denied' : 'status-pending'} 
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Tag label={`${conn.quantity} ${conn.item}`} variant="category" />
                      {conn.distance !== 'N/A' && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <MapPin size={13} className="text-brand-primary" />
                          {conn.distance}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">• {conn.timeAgo}</span>
                    </div>
                  </div>
                </div>
                
                {conn.description && (
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-2">{conn.description}</p>
                )}

                {conn.schoolRequestData && (
                  <div className="mb-4 p-3 bg-brand-secondary/20 rounded-[5px] border border-brand-primary/20 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-brand-dark">Resource Manifest Attached</span>
                      <span className="text-[11px] text-brand-primary font-semibold">
                        {conn.schoolRequestData.selectedCategories.length} Categories
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {conn.schoolRequestData.selectedCategories.map(cat => (
                        <Tag key={cat} label={cat} variant="category" size="sm" />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Scope: <strong className="capitalize">{conn.schoolRequestData.requestScope}</strong> • Estimated need: <strong>{conn.schoolRequestData.expectedStudentsInNeed} students</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Cohesive Hierarchy */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForModal(conn)}
                  className="flex-1 py-2 px-3 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                >
                  <Eye size={14} className="text-slate-500" />
                  <span>View Details</span>
                </button>

                {conn.type === 'received' ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => handleApprove(conn.id)}
                      className="flex-1 py-2 px-3.5 rounded-[5px] bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                    >
                      <Check size={15} />
                      <span>Approve</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeny(conn.id)}
                      className="py-2 px-3 rounded-[5px] hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                    >
                      <X size={15} />
                      <span>Deny</span>
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    onClick={() => handleDeny(conn.id)}
                    className="flex-1 py-2 px-3 rounded-[5px] hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                  >
                    <X size={14} />
                    <span>Cancel Request</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredRequests.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-[6px] text-slate-400 p-8 text-center">
              <Package size={44} className="mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700 mb-1">No pending {activeTab} requests</p>
              <p className="text-xs text-slate-400 max-w-sm">
                {activeTab === 'sent' 
                  ? "You have no active pending requests sent to community partners."
                  : "There are no incoming requests waiting for your approval right now."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Request Submission Detail Modal with the same level of detail */}
      <AnimatePresence>
        {selectedRequestForModal && (
          <RequestDetailModal 
            request={selectedRequestForModal} 
            onClose={() => setSelectedRequestForModal(null)} 
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
