import React from 'react';
import { motion } from 'motion/react';
import { 
  X, Check, Building2, Users, Phone, Mail, MapPin, 
  Package, Backpack, Sparkles, Truck, Calendar, FileText, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, Utensils, Shirt, Book, Library, Laptop, Home, Palette
} from 'lucide-react';
import { ConnectionRequest, SchoolResourceRequest } from '../types';
import Tag from './Tag';

interface RequestDetailModalProps {
  request: ConnectionRequest;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
}

export default function RequestDetailModal({ request, onClose, onApprove, onDeny }: RequestDetailModalProps) {
  const data: SchoolResourceRequest | undefined = request.schoolRequestData;

  const getSupplyIcon = (item: string) => {
    const lower = item.toLowerCase();
    if (lower.includes('food') || lower.includes('meal')) return <Utensils size={18} className="text-brand-primary" />;
    if (lower.includes('backpack')) return <Backpack size={18} className="text-brand-primary" />;
    if (lower.includes('clothing') || lower.includes('shirt')) return <Shirt size={18} className="text-brand-primary" />;
    if (lower.includes('book') || lower.includes('textbook')) return <Book size={18} className="text-brand-primary" />;
    if (lower.includes('library') || lower.includes('school')) return <Library size={18} className="text-brand-primary" />;
    if (lower.includes('tech') || lower.includes('laptop') || lower.includes('computer')) return <Laptop size={18} className="text-brand-primary" />;
    if (lower.includes('furniture') || lower.includes('chair') || lower.includes('desk')) return <Home size={18} className="text-brand-primary" />;
    if (lower.includes('art') || lower.includes('paint') || lower.includes('supply')) return <Palette size={18} className="text-brand-primary" />;
    return <Package size={18} className="text-brand-primary" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative bg-white rounded-[6px] shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/70">
          <div className="flex items-start gap-4">
            <img 
              src={request.fromAvatar} 
              alt={request.fromName} 
              className="w-14 h-14 rounded-[5px] object-cover border border-slate-200 mt-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                  {request.type === 'received' ? 'Incoming Resource Request' : 'Outgoing Partnership Request'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <Tag 
                  label={request.status} 
                  variant={request.status === 'approved' ? 'status-approved' : request.status === 'denied' ? 'status-denied' : 'status-pending'} 
                />
              </div>
              <h2 className="text-2xl font-serif font-bold text-brand-dark">
                {data ? data.schoolName : request.fromName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted {request.timeAgo} • Supply Item: <strong className="text-slate-700 capitalize">{request.item}</strong> ({request.quantity} units)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-[5px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-sm text-slate-700">
          {/* Institutional Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-[6px] border border-slate-200/70">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Request Scope</span>
              <span className="font-bold text-slate-800 capitalize">
                {data ? (data.requestScope === 'district' ? 'School District' : 'Single School') : (request.type === 'received' ? 'Community Partner' : 'School Request')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Supply Volume</span>
              <span className="font-bold text-brand-primary text-base">
                {request.quantity} {request.item}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contact Person</span>
              <span className="font-semibold text-slate-800 truncate block">
                {data?.contactName || 'Jane Doe'}
              </span>
              <span className="block text-[11px] text-slate-400 truncate">{data?.contactRole || 'Resource Coordinator'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Location / Distance</span>
              <span className="font-semibold text-slate-800 truncate block">
                {request.distance !== 'N/A' ? request.distance : (data?.state || 'Midland, MI')}
              </span>
              <span className="block text-[11px] text-slate-400">{data?.phone || '(555) 342-8921'}</span>
            </div>
          </div>

          {/* Requested Items & Breakdown for all requests */}
          <div className="border border-slate-200 rounded-[6px] p-4 bg-white">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              {getSupplyIcon(request.item)}
              <h4 className="font-bold text-slate-900">Resource Specifications & Manifest</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-[5px] border border-slate-100">
                <span className="text-slate-400 block font-medium">Primary Item</span>
                <span className="text-sm font-bold text-slate-800 capitalize mt-0.5">{request.item}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-[5px] border border-slate-100">
                <span className="text-slate-400 block font-medium">Quantity Requested</span>
                <span className="text-sm font-bold text-brand-primary mt-0.5">{request.quantity} Units</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-[5px] border border-slate-100">
                <span className="text-slate-400 block font-medium">Fulfillment Window</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5">
                  {request.availableUntil || 'Standard Distribution'}
                </span>
              </div>
            </div>

            {request.description && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Request Details & Notes</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-[5px] border border-slate-100">
                  {request.description}
                </p>
              </div>
            )}
          </div>

          {/* If Full School Request Form Data is attached, render the deep breakdown */}
          {data && (
            <div className="space-y-4">
              {/* Requested Categories Badges */}
              {data.selectedCategories && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requested Resource Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.selectedCategories.map(cat => (
                      <Tag key={cat} label={cat} variant="category" />
                    ))}
                  </div>
                </div>
              )}

              {/* Backpacks Specification */}
              {data.backpacks && (
                <div className="border border-slate-200 rounded-[6px] p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <Backpack size={16} className="text-brand-primary" />
                    <h4 className="font-bold text-slate-900">Backpacks Distribution Details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                      <span className="text-slate-400 block font-medium">Solid Color (15"/17")</span>
                      <span className="text-base font-bold text-slate-800">{data.backpacks.solidQty} Units</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                      <span className="text-slate-400 block font-medium">Clear Transparent (17")</span>
                      <span className="text-base font-bold text-slate-800">{data.backpacks.clearQty} Units</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                      <span className="text-slate-400 block font-medium">Clear Mandate Status</span>
                      <span className="font-semibold text-slate-800">{data.backpacks.mandateStatus || 'No strict mandate'}</span>
                    </div>
                  </div>
                  {data.backpacks.gradeBands && data.backpacks.gradeBands.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Target Grade Bands</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.backpacks.gradeBands.map(gb => (
                          <Tag key={gb} label={gb} variant="neutral" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* School Supplies Breakdown */}
              {data.schoolSupplies && (
                <div className="border border-slate-200 rounded-[6px] p-4 bg-white">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-brand-primary" />
                      <h4 className="font-bold text-slate-900">School Supplies Manifest</h4>
                    </div>
                    <Tag 
                      label={data.schoolSupplies.packagedKits ? 'Individually Packaged Kits' : 'Bulk Supply Distribution'} 
                      variant="category" 
                      size="sm" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(data.schoolSupplies.items).map(([name, qty]) => (
                      <div key={name} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 truncate pr-2">{name}</span>
                        <span className="font-bold text-slate-900">{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hygiene Products Breakdown */}
              {data.hygiene && (
                <div className="border border-slate-200 rounded-[6px] p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <Sparkles size={16} className="text-brand-primary" />
                    <h4 className="font-bold text-slate-900">Hygiene & Wellness Items</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(data.hygiene.items).map(([name, qty]) => (
                      <div key={name} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 truncate pr-2">{name}</span>
                        <span className="font-bold text-slate-900">{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logistics & Delivery Details */}
              {data.logistics && (
                <div className="bg-slate-50 p-4 rounded-[6px] border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-brand-primary" />
                    <h4 className="font-bold text-slate-900">Delivery Logistics & Drop-off Coordination</h4>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-700">Method:</span> {data.logistics.method}</p>
                    {data.logistics.eventDate && (
                      <p><span className="font-bold text-slate-700">Target Date:</span> {data.logistics.eventDate}</p>
                    )}
                    {data.logistics.specialInstructions && (
                      <p><span className="font-bold text-slate-700">Building Access Notes:</span> {data.logistics.specialInstructions}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact & Coordination Details */}
          <div className="bg-slate-50 p-4 rounded-[6px] border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Organization Direct Support</span>
              <p className="font-bold text-slate-800">{request.fromName}</p>
              <p className="text-slate-600">Contact: Jane Doe (Coordinator)</p>
            </div>
            <div className="space-y-1 text-xs sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Communication Line</span>
              <p className="text-slate-700 flex sm:justify-end items-center gap-1.5">
                <Phone size={13} className="text-brand-primary" />
                (555) 342-8921
              </p>
              <p className="text-slate-700 flex sm:justify-end items-center gap-1.5">
                <Mail size={13} className="text-brand-primary" />
                coordination@organization.org
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer with Cohesive Primary and Secondary Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Realize to Act Platform • Resource Exchange Network
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-none"
            >
              Close
            </button>

            {onDeny && (
              <button 
                type="button"
                onClick={() => {
                  onDeny(request.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-[5px] hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold transition-all cursor-pointer shadow-none"
              >
                {request.type === 'received' ? 'Deny Request' : 'Cancel Request'}
              </button>
            )}

            {onApprove && request.type === 'received' && (
              <button 
                type="button"
                onClick={() => {
                  onApprove(request.id);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-[5px] bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-none"
              >
                <Check size={15} />
                <span>Approve Request</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
