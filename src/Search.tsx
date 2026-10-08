import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, MapPin, Check, Filter, ChevronDown, 
  Map as MapIcon, List, X, Calendar, Send, Eye,
  Plus, Minus, Sparkles, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';
import { ConnectionRequest, SchoolResourceRequest, User } from './types';
import { recordSchoolSentRequest, subscribeToSchoolSentRequests, createRequest } from './lib/requests';
import { RESOURCE_CATEGORIES, CategoryDefinition } from './data/categories';
import RequestDetailModal from './components/RequestDetailModal';
import Tag, { getCategoryIcon } from './components/Tag';

interface SearchProps {
  connections: ConnectionRequest[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionRequest[]>>;
  user: User;
}

const BROADCAST_AVATAR = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&h=150&fit=crop';

export default function Search({ connections, setConnections, user }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedGradeBand, setSelectedGradeBand] = useState<string>('all');
  const [radius, setRadius] = useState<number>(25);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'distance' | 'connected'>('relevance');
  
  // Request Modal State
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [selectedPartnerForRequest, setSelectedPartnerForRequest] = useState<any>(null);
  const [isBroadcastRequest, setIsBroadcastRequest] = useState(false);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [selectedRequestForDetailModal, setSelectedRequestForDetailModal] = useState<ConnectionRequest | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Community partners registered in Firestore ("users" with userType
  // 'community-partner'), shaped like the cards below expect.
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        setPartners(
          snapshot.docs
            .filter(docSnap => docSnap.id !== user.id && docSnap.data().userType === 'community-partner')
            .map(docSnap => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                name: data.orgName ?? data.contactName ?? 'Unnamed Organization',
                avatar: data.avatar ?? BROADCAST_AVATAR,
                description: data.about ?? data.description ?? '',
                distance: data.location ?? 'N/A',
                distanceValue: 0,
                category: data.category ?? '',
                tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ['General'],
                quantity: typeof data.quantity === 'number' ? data.quantity : 0,
                postedAt: data.postedAt ?? '',
                availableUntil: data.availableUntil ?? '',
                contactName: data.contactName ?? '',
                contactRole: data.contactRole ?? '',
                email: data.email ?? '',
                phone: data.phone ?? '',
                state: data.state ?? '',
                dropOffDetails: data.dropOffDetails ?? '',
                isConnected: false,
              };
            })
        );
      } catch (error) {
        console.error('Error loading community partners:', error);
      }
    };

    loadPartners();
  }, [user.id]);

  // Partners this user already sent a request to, from the 'requests-sent' log.
  useEffect(() => {
    const unsubscribe = subscribeToSchoolSentRequests(user.id, (sentList) => {
      const ids: string[] = [];
      sentList.forEach((req) => {
        if (req.communityPartnerId) ids.push(req.communityPartnerId);
      });
      setSentIds((prev) => Array.from(new Set([...prev, ...ids])));
    });
    return () => unsubscribe();
  }, [user.id]);

  // ...and from requests they sent that are still live.
  useEffect(() => {
    const sentFromConnections = connections.filter((c) => c.type === 'sent').map((c) => c.fromId);
    if (sentFromConnections.length > 0) {
      setSentIds((prev) => Array.from(new Set([...prev, ...sentFromConnections])));
    }
  }, [connections]);

  // Deep Request Form State
  const [requestCategory, setRequestCategory] = useState<string>('backpacks');
  const [requestSubcategories, setRequestSubcategories] = useState<string[]>([]);
  const [requestQuantity, setRequestQuantity] = useState<string>('100');
  const [requestGradeBand, setRequestGradeBand] = useState<string>('All Elementary (K-5)');
  const [requestDeliveryNotes, setRequestDeliveryNotes] = useState<string>('');
  const [requestError, setRequestError] = useState<string>('');

  const activeFilterCategoryDef = RESOURCE_CATEGORIES.find(c => c.id === selectedCategory);
  const activeRequestCategoryDef = RESOURCE_CATEGORIES.find(c => c.id === requestCategory) || RESOURCE_CATEGORIES[0];

  const getCategoryMatchCount = (catId: string) => {
    if (catId === 'all') return allPartners.length;
    const catDef = RESOURCE_CATEGORIES.find(c => c.id === catId);
    if (!catDef) return 0;
    return allPartners.filter(p => 
      p.category === catId || 
      p.tags.some(t => t.toLowerCase().includes(catDef.label.toLowerCase())) ||
      p.tags.some(t => catDef.subcategories.some(sc => sc.label.toLowerCase().includes(t.toLowerCase())))
    ).length;
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedSubcategories.length +
    (selectedGradeBand !== 'all' ? 1 : 0) +
    (radius !== 25 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const connectedIds = new Set(connections.filter(c => c.status === 'approved').map(c => c.fromId));
  const partnerIds = new Set(partners.map(p => p.id));
  const allPartners = [
    ...partners.map(p => ({ ...p, isConnected: connectedIds.has(p.id) })),
    ...connections.filter(c => c.status === 'approved' && c.fromId !== 'everyone' && !partnerIds.has(c.fromId)).map(c => ({
      id: c.fromId,
      name: c.fromName,
      avatar: c.fromAvatar,
      description: c.description || '',
      distance: c.distance,
      distanceValue: parseFloat(c.distance) || 0,
      category: 'school-supplies',
      tags: [c.item, 'Verified Connection'],
      quantity: c.quantity,
      postedAt: c.postedAt || 'Recently active',
      availableUntil: c.availableUntil || 'Ongoing',
      isConnected: true,
      timeAgo: c.timeAgo
    }))
  ];

  const filteredPartners = allPartners.filter(partner => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      partner.name.toLowerCase().includes(query) || 
      partner.description.toLowerCase().includes(query) ||
      partner.tags.some(tag => tag.toLowerCase().includes(query));

    // Match primary category
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const catDef = RESOURCE_CATEGORIES.find(c => c.id === selectedCategory);
      matchesCategory = partner.category === selectedCategory || 
        partner.tags.some(t => t.toLowerCase().includes(catDef?.label.toLowerCase() || '')) ||
        (catDef && partner.tags.some(t => catDef.subcategories.some(sc => sc.label.toLowerCase().includes(t.toLowerCase()))));
    }

    // Match subcategory specifications
    let matchesSubcategory = true;
    if (selectedSubcategories.length > 0 && activeFilterCategoryDef) {
      const activeSubcats = activeFilterCategoryDef.subcategories.filter(sc => selectedSubcategories.includes(sc.id));
      matchesSubcategory = activeSubcats.some(sc => 
        partner.tags.some(t => 
          t.toLowerCase().includes(sc.label.toLowerCase()) || 
          sc.label.toLowerCase().includes(t.toLowerCase())
        ) || partner.description.toLowerCase().includes(sc.label.toLowerCase())
      );
    }

    // Match grade band target
    let matchesGradeBand = true;
    if (selectedGradeBand !== 'all') {
      const target = selectedGradeBand.toLowerCase();
      matchesGradeBand = partner.tags.some(t => t.toLowerCase().includes(target)) || 
        partner.description.toLowerCase().includes(target) ||
        (selectedGradeBand === 'elementary' && (partner.description.toLowerCase().includes('k-') || partner.tags.some(t => t.toLowerCase().includes('k-2') || t.toLowerCase().includes('3-5') || t.toLowerCase().includes('elementary')))) ||
        (selectedGradeBand === 'middle' && (partner.description.toLowerCase().includes('6-') || partner.tags.some(t => t.toLowerCase().includes('6-8') || t.toLowerCase().includes('middle')))) ||
        (selectedGradeBand === 'high' && (partner.description.toLowerCase().includes('9-') || partner.tags.some(t => t.toLowerCase().includes('9-12') || t.toLowerCase().includes('high school'))));
    }

    const matchesRadius = partner.distanceValue <= radius;
    const isNotExpired = partner.availableUntil !== 'Expired';

    return matchesSearch && matchesCategory && matchesSubcategory && matchesGradeBand && matchesRadius && isNotExpired;
  }).sort((a, b) => {
    if (sortBy === 'relevance') {
      if (a.isConnected !== b.isConnected) return a.isConnected ? -1 : 1;
      return a.distanceValue - b.distanceValue;
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'distance') return a.distanceValue - b.distanceValue;
    if (sortBy === 'connected') {
      if (a.isConnected === b.isConnected) return a.name.localeCompare(b.name);
      return a.isConnected ? -1 : 1;
    }
    return 0;
  });

  const handleOpenRequestModal = (partner: any) => {
    setSelectedPartnerForRequest(partner);
    setIsBroadcastRequest(false);
    setRequestCategory(partner.category || 'backpacks');
    setRequestSubcategories([]);
    setRequestQuantity(partner.quantity ? String(partner.quantity) : '100');
    setRequestDeliveryNotes('');
    setRequestError('');
    setShowCreateRequest(true);
  };

  const handleOpenBroadcastModal = () => {
    setSelectedPartnerForRequest(null);
    setIsBroadcastRequest(true);
    setRequestCategory('backpacks');
    setRequestSubcategories([]);
    setRequestQuantity('150');
    setRequestDeliveryNotes('');
    setRequestError('');
    setShowCreateRequest(true);
  };

  const handleToggleRequestSubcategory = (subcatLabel: string) => {
    setRequestSubcategories(prev => 
      prev.includes(subcatLabel) 
        ? prev.filter(s => s !== subcatLabel) 
        : [...prev, subcatLabel]
    );
  };

  const handleOpenPartnerDetailsModal = (partner: any) => {
    const existingReq = connections.find(c => c.fromId === partner.id || c.fromName === partner.name);
    if (existingReq) {
      setSelectedRequestForDetailModal(existingReq);
    } else {
      const generatedReq: ConnectionRequest = {
        id: `partner-detail-${partner.id}`,
        fromId: partner.id,
        fromName: partner.name,
        fromAvatar: partner.avatar,
        type: 'received',
        status: partner.isConnected ? 'approved' : 'pending',
        item: partner.tags?.[0] || 'Community Resources',
        quantity: partner.quantity || 100,
        distance: partner.distance || 'Midland, MI',
        timeAgo: partner.postedAt || 'Recently active',
        timestamp: Date.now(),
        description: partner.description || 'Community resource partner dedicated to providing essential materials and distribution support to classrooms.',
        postedAt: partner.postedAt || 'Active distribution',
        availableUntil: partner.availableUntil || 'Ongoing partnership',
        schoolRequestData: {
          schoolName: partner.name,
          contactName: partner.contactName || 'Not provided',
          contactRole: partner.contactRole || 'Not provided',
          email: partner.email || 'Not provided',
          phone: partner.phone || 'Not provided',
          state: partner.state || partner.distance || 'Not provided',
          requestScope: 'district',
          expectedStudentsInNeed: partner.quantity || 0,
          selectedCategories: partner.tags,
          logistics: {
            method: 'Standard scheduled drop-off at designated facility dock or main entrance',
            eventDate: partner.availableUntil || 'Current semester',
            specialInstructions: partner.dropOffDetails || 'Staff or volunteer coordinator will greet and assist unloading.'
          }
        }
      };
      setSelectedRequestForDetailModal(generatedReq);
    }
  };

  const handleSubmitRequest = async () => {
    const qty = parseInt(requestQuantity);
    if (!qty || qty <= 0) {
      setRequestError('Please specify a valid quantity needed.');
      return;
    }
    if (!isBroadcastRequest && !selectedPartnerForRequest) return;
    if (isSubmitting) return;

    const catDef = RESOURCE_CATEGORIES.find(c => c.id === requestCategory) || RESOURCE_CATEGORIES[0];
    const itemsList = requestSubcategories.length > 0 
      ? requestSubcategories.join(', ') 
      : catDef.subcategories.slice(0, 2).map(s => s.label).join(', ');
    const item = `${catDef.label} (${itemsList})`;
    const description = requestDeliveryNotes.trim() || `Request for ${qty} units of ${catDef.label} (${requestGradeBand}) for student distribution.`;

    // Rich manifest describing the requesting organization and what it needs,
    // stored on the request document as `schoolRequestData`.
    const requestManifest: SchoolResourceRequest = {
      schoolName: user.name,
      contactName: user.contactName || '',
      contactRole: user.contactRole || '',
      email: user.email || '',
      phone: user.phone || '',
      state: user.state || user.location || '',
      requestScope: 'district',
      expectedStudentsInNeed: qty,
      selectedCategories: [catDef.label, ...requestSubcategories],
      logistics: {
        method: 'Realize to Act volunteer or partner drop-off direct to school facility',
        eventDate: 'Scheduled school distribution event',
        specialInstructions: requestDeliveryNotes.trim() || user.dropOffDetails || 'Deliver to main office entrance reception.'
      }
    };

    const targets: any[] = isBroadcastRequest ? filteredPartners : [selectedPartnerForRequest];
    setIsSubmitting(true);
    try {
      for (const partner of targets) {
        await recordSchoolSentRequest({
          userId: user.id,
          fromName: user.name,
          communityPartner: partner.name,
          communityPartnerId: partner.id,
          item,
          quantity: qty,
          additionalDetails: description,
        });
      }

      // A broadcast is one request with no recipient (toUid == null), which
      // every community partner sees; otherwise it goes to the chosen partner.
      // The requests subscription in App.tsx adds it to `connections`.
      await createRequest({
        fromUid: user.id,
        fromName: user.name,
        fromAvatar: user.avatar || BROADCAST_AVATAR,
        toUid: isBroadcastRequest ? null : selectedPartnerForRequest.id,
        toName: isBroadcastRequest ? null : selectedPartnerForRequest.name,
        toAvatar: isBroadcastRequest ? null : selectedPartnerForRequest.avatar,
        item,
        quantity: qty,
        distance: isBroadcastRequest ? 'District-Wide' : selectedPartnerForRequest.distance,
        description,
        availability: user.allowAvailabilityView !== false ? user.availability : undefined,
        schoolRequestData: requestManifest,
      });

      setSentIds(prev => [...new Set([...prev, ...targets.map((p: any) => p.id)])]);
      setShowCreateRequest(false);
    } catch (err) {
      console.error('Error sending supply request:', err);
      setRequestError('Could not send the request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Resource Discovery</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark mt-1">Search Community Partners</h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover local resource providers, filter by detailed supply categories, and dispatch supply requests.
          </p>
        </div>
        
        {/* View Mode Toggle Tally matching sign-in tally */}
        <div className="flex p-1 bg-slate-100 rounded-[5px] w-fit">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer",
              viewMode === 'list' ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List size={16} />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer",
              viewMode === 'map' ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <MapIcon size={16} />
            <span>Map View</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="bg-white rounded-[6px] p-6 sm:p-8 border border-slate-200/80 shadow-xs min-h-[600px] flex flex-col space-y-6">
        
        {/* Search & Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by supply type (backpacks, hygiene, food, chromebooks) or partner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowFilterModal(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-[5px] text-xs font-bold transition-all cursor-pointer shadow-none",
                activeFiltersCount > 0
                  ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              )}
            >
              <Filter size={15} className={activeFiltersCount > 0 ? "text-brand-primary" : "text-slate-500"} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="relative min-w-[180px]">
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-4 pr-9 py-3 rounded-[5px] border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="relevance">Sort: Most Relevant</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="distance">Sort: Nearest Distance</option>
                <option value="connected">Status: Connected First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Strip - High Visibility & Instant Understanding */}
        {activeFiltersCount > 0 && (
          <div className="p-3.5 bg-brand-primary/5 rounded-[6px] border border-brand-primary/25 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mr-1">
                <Filter size={14} className="text-brand-primary" />
                <span>Active Filters ({activeFiltersCount}):</span>
              </span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs">
                  <span>Keyword: <strong className="font-bold">"{searchQuery}"</strong></span>
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')} 
                    className="text-slate-400 hover:text-red-600 cursor-pointer ml-0.5"
                    title="Remove keyword filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && activeFilterCategoryDef && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white border border-brand-primary/40 text-brand-primary font-bold shadow-2xs">
                  {getCategoryIcon(activeFilterCategoryDef.label, 13)}
                  <span>Category: {activeFilterCategoryDef.label}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategories([]);
                    }} 
                    className="text-slate-400 hover:text-red-600 cursor-pointer ml-0.5"
                    title="Remove category filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {selectedSubcategories.map(scId => {
                const sc = activeFilterCategoryDef?.subcategories.find(s => s.id === scId);
                return sc ? (
                  <span key={scId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs">
                    <span>Item: {sc.label}</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedSubcategories(prev => prev.filter(id => id !== scId))} 
                      className="text-slate-400 hover:text-red-600 cursor-pointer ml-0.5"
                      title="Remove item filter"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ) : null;
              })}

              {selectedGradeBand !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white border border-slate-200 text-slate-800 font-medium capitalize shadow-2xs">
                  <span>Grade: {selectedGradeBand === 'elementary' ? 'Elementary (K-5)' : selectedGradeBand === 'middle' ? 'Middle (6-8)' : 'High School (9-12)'}</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedGradeBand('all')} 
                    className="text-slate-400 hover:text-red-600 cursor-pointer ml-0.5"
                    title="Remove grade filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {radius !== 25 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs">
                  <span>Radius: {radius} miles</span>
                  <button 
                    type="button"
                    onClick={() => setRadius(25)} 
                    className="text-slate-400 hover:text-red-600 cursor-pointer ml-0.5"
                    title="Reset radius to default"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-slate-700 font-medium">
                <strong>{filteredPartners.length}</strong> {filteredPartners.length === 1 ? 'partner' : 'partners'} match
              </span>
              <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="px-2.5 py-1 rounded bg-white hover:bg-brand-primary/10 text-brand-primary border border-brand-primary/30 text-xs font-bold transition-all cursor-pointer"
              >
                Edit Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSubcategories([]);
                  setSelectedGradeBand('all');
                  setRadius(25);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Section Title & Broadcast Action */}
        <div className="flex justify-between items-center pt-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-brand-dark">Available Partners</h2>
            <span className="text-xs text-slate-400">({filteredPartners.length} matches)</span>
          </div>
          <button 
            type="button"
            onClick={handleOpenBroadcastModal}
            className="text-brand-primary hover:text-brand-dark font-bold text-xs transition-all underline underline-offset-4 cursor-pointer"
          >
            Broadcast Supply Request to All
          </button>
        </div>

        {/* Results View (List or Map) */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredPartners.map((item: any) => {
                  const isSent = sentIds.includes(item.id);
                  
                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-[6px] border border-slate-200 bg-white hover:border-brand-primary/30 transition-all flex flex-col sm:flex-row gap-5 shadow-xs"
                    >
                      <div className="w-16 h-16 rounded-[5px] overflow-hidden shrink-0 border border-slate-200">
                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                          {item.isConnected ? (
                            <Tag label="Connected" variant="status-approved" />
                          ) : (
                            <Tag label="Active Partner" variant="status-pending" />
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        
                        {/* Consistent Tag Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {item.tags.map((tag: string) => (
                            <Tag key={tag} label={tag} variant="category" />
                          ))}

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-2">
                            <MapPin size={13} className="text-brand-primary" />
                            <span>{item.distance}</span>
                          </div>

                          {item.availableUntil && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <Calendar size={13} className="text-brand-primary" />
                              <span>Fulfillment: {item.availableUntil}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons Cohesive Hierarchy */}
                      <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                        <button 
                          type="button"
                          onClick={() => handleOpenPartnerDetailsModal(item)}
                          className="w-full sm:w-[130px] py-2 px-3 rounded-[5px] font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                        >
                          <Eye size={13} className="text-slate-500" />
                          <span>View Details</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleOpenRequestModal(item)}
                          disabled={isSent}
                          className={cn(
                            "w-full sm:w-[130px] py-2 px-3 rounded-[5px] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-none",
                            isSent
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-brand-primary hover:bg-brand-dark text-white cursor-pointer"
                          )}
                        >
                          {isSent ? (
                            <>
                              <Check size={13} />
                              <span>Request Sent</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Send Request</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-[550px] rounded-[6px] overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <MapIcon size={48} className="mx-auto mb-3 text-brand-primary opacity-60" />
                  <h3 className="font-serif font-bold text-lg text-brand-dark mb-1">Interactive Map Overview</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    Visualizing partners within {radius} miles of your school district. Use detailed filters to narrow by supply categories.
                  </p>
                  <button 
                    onClick={() => setViewMode('list')}
                    className="px-5 py-2.5 rounded-[5px] bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold transition-all cursor-pointer shadow-none"
                  >
                    Switch to List View
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredPartners.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-[6px] my-4">
            <SearchIcon size={40} className="mb-3 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-600 text-sm">No partners found matching your search</p>
            <p className="text-xs text-slate-400 mt-1">Try expanding your category selection or increasing the radius.</p>
          </div>
        )}
      </div>

      {/* Filter Modal with Deep Categories and Radius Selector */}
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
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">Filter Partners</h3>
                  <p className="text-xs text-slate-500">Filter by category, items, grade level, and distance</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowFilterModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* 1. Category */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      1. Category
                    </label>
                    {selectedCategory !== 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedSubcategories([]);
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
                        setSelectedCategory('all');
                        setSelectedSubcategories([]);
                      }}
                      className={cn(
                        "p-2.5 rounded-[5px] text-xs font-bold transition-all text-left border flex items-center justify-between cursor-pointer",
                        selectedCategory === 'all' 
                          ? "bg-brand-primary text-white border-brand-primary shadow-xs" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Package size={14} className={selectedCategory === 'all' ? "text-white" : "text-brand-primary"} />
                        <span>All Supplies</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        selectedCategory === 'all' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        {allPartners.length}
                      </span>
                    </button>
                    {RESOURCE_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count = getCategoryMatchCount(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setSelectedSubcategories([]);
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
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1",
                            isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                          )}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Specific Items */}
                {activeFilterCategoryDef && (
                  <div className="p-3.5 bg-brand-primary/5 rounded-[6px] border border-brand-primary/25 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                        2. Items ({activeFilterCategoryDef.label})
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSubcategories(activeFilterCategoryDef.subcategories.map(s => s.id))}
                          className="text-[11px] text-brand-primary font-bold hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedSubcategories([])}
                          className="text-[11px] text-slate-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeFilterCategoryDef.subcategories.map(sc => {
                        const isSelected = selectedSubcategories.includes(sc.id);
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubcategories(prev => 
                                prev.includes(sc.id)
                                  ? prev.filter(id => id !== sc.id)
                                  : [...prev, sc.id]
                              );
                            }}
                            className={cn(
                              "p-2.5 rounded-[4px] text-xs font-medium transition-all flex items-center justify-between border cursor-pointer",
                              isSelected
                                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-brand-primary/40"
                            )}
                          >
                            <span>{sc.label}</span>
                            <span className={cn(
                              "w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 text-[10px]",
                              isSelected ? "bg-white text-brand-primary border-white" : "border-slate-300 bg-slate-50"
                            )}>
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Grade Level */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      3. Grade Level
                    </label>
                    {selectedGradeBand !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedGradeBand('all')}
                        className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'all', label: 'All Grades', sub: 'K-12' },
                      { id: 'elementary', label: 'Elementary', sub: 'K-5' },
                      { id: 'middle', label: 'Middle', sub: '6-8' },
                      { id: 'high', label: 'High School', sub: '9-12' }
                    ].map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedGradeBand(b.id)}
                        className={cn(
                          "p-2 rounded-[5px] text-xs font-bold transition-all text-center border cursor-pointer flex flex-col items-center justify-center",
                          selectedGradeBand === b.id
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <span>{b.label}</span>
                        <span className={cn("text-[10px] font-normal", selectedGradeBand === b.id ? "text-white/80" : "text-slate-400")}>
                          {b.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Distance Radius */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      4. Distance
                    </label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                      Within {radius} mi
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { mi: 10, label: '10 mi', sub: 'Local' },
                      { mi: 25, label: '25 mi', sub: 'Standard' },
                      { mi: 50, label: '50 mi', sub: 'Regional' }
                    ].map(r => (
                      <button
                        key={r.mi}
                        type="button"
                        onClick={() => setRadius(r.mi)}
                        className={cn(
                          "py-1.5 px-2 rounded-[4px] text-xs font-bold transition-all text-center border cursor-pointer flex flex-col items-center",
                          radius === r.mi
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <span>{r.label}</span>
                        <span className={cn("text-[10px] font-normal", radius === r.mi ? "text-white/80" : "text-slate-400")}>
                          {r.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-[5px] appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>1 mi</span>
                    <span>25 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategories([]);
                    setSelectedGradeBand('all');
                    setRadius(25);
                  }}
                  className="py-2.5 px-4 rounded-[5px] font-semibold text-xs text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-none"
                >
                  Reset
                </button>
                <button 
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-xs transition-all cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>View {filteredPartners.length} Matching {filteredPartners.length === 1 ? 'Partner' : 'Partners'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Supply Request Modal with the Same Level of Depth */}
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
                    Supply Request
                  </span>
                  <h3 className="text-xl font-serif font-bold text-brand-dark mt-0.5">
                    {isBroadcastRequest ? 'Broadcast Supply Request' : `Send Request to ${selectedPartnerForRequest?.name}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specify supply categories, items, quantity, and delivery details.
                  </p>
                </div>
                <button onClick={() => setShowCreateRequest(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {requestError && (
                  <div className="p-3 rounded-[5px] bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                    {requestError}
                  </div>
                )}

                {/* 1. Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Category*
                  </label>
                  <div className="flex flex-wrap p-1 bg-slate-100 rounded-[5px] gap-1">
                    {RESOURCE_CATEGORIES.map(cat => {
                      const isSelected = requestCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setRequestCategory(cat.id);
                            setRequestSubcategories([]);
                            setRequestError('');
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
                      const isChecked = requestSubcategories.includes(subcat.label);
                      return (
                        <button
                          key={subcat.id}
                          type="button"
                          onClick={() => handleToggleRequestSubcategory(subcat.label)}
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
                        onClick={() => setRequestGradeBand(band)}
                        className={cn(
                          "flex-1 py-2 px-1 rounded-[5px] text-xs font-bold transition-all text-center cursor-pointer",
                          requestGradeBand === band
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
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      4. Quantity*
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">Quick pick:</span>
                      {['50', '100', '250', '500'].map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setRequestQuantity(q);
                            if (requestError) setRequestError('');
                          }}
                          className={cn(
                            "px-2 py-0.5 rounded-[4px] text-[10px] font-bold border transition-all cursor-pointer",
                            requestQuantity === q
                              ? "bg-brand-primary text-white border-brand-primary"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="e.g. 100" 
                    value={requestQuantity}
                    onChange={(e) => {
                      setRequestQuantity(e.target.value);
                      if (requestError) setRequestError('');
                    }}
                    className="w-full px-4 py-3 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Total packages or units.</p>
                </div>

                {/* 5. Delivery & Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    5. Delivery & Notes
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Delivery date, school entrance, or handling notes..." 
                    value={requestDeliveryNotes}
                    onChange={(e) => setRequestDeliveryNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm leading-relaxed" 
                  />
                </div>
              </div>

              {/* Action Buttons Cohesive Style */}
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
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-xs transition-all cursor-pointer shadow-none flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Request'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Request Detail Modal */}
      <AnimatePresence>
        {selectedRequestForDetailModal && (
          <RequestDetailModal 
            request={selectedRequestForDetailModal} 
            onClose={() => setSelectedRequestForDetailModal(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
