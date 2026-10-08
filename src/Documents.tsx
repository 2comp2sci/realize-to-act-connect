import React, { useState, useEffect } from 'react';
import { 
  FileText, Check, Download, Eye, 
  X, Upload, PenTool, Type, Calendar, Pencil, Trash2, Search, Ban, ChevronDown, Filter, Clock, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Document } from './types';
import Tag from './components/Tag';
import { deleteDocument, signDocument } from './lib/documents';

interface DocumentsProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  updateLastAction: () => void;
}

const SignatureCanvas = ({ onSave, onClear }: { onSave: (dataUrl: string) => void, onClear: () => void }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onClear();
    }
  };

  return (
    <div className="relative w-full h-48 bg-slate-50 border border-slate-200 rounded-[5px] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 bg-brand-primary rounded-[5px] text-xs font-bold text-white hover:bg-brand-dark transition-all"
        >
          Save
        </button>
        <button 
          onClick={handleClear}
          className="px-4 py-1.5 border border-slate-200 bg-white rounded-[5px] text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default function Documents({ documents, setDocuments, updateLastAction }: DocumentsProps) {
  const [showSignModal, setShowSignModal] = useState(false);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [signMethod, setSignMethod] = useState<'type' | 'draw'>('type');
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showAllPending, setShowAllPending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDetails, setRejectDetails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'signed'>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Extract distinct partner names
  const partnerNames = Array.from(new Set(documents.map(d => d.fromName)));

  const pendingDocs = documents.filter(d => {
    if (d.status !== 'pending') return false;
    if (partnerFilter !== 'all' && d.fromName !== partnerFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.fromName.toLowerCase().includes(q) || d.itemDescription.toLowerCase().includes(q);
  });
  const displayedPendingDocs = showAllPending ? pendingDocs : pendingDocs.slice(0, 2);

  const signedDocs = documents.filter(d => {
    if (d.status !== 'signed') return false;
    if (partnerFilter !== 'all' && d.fromName !== partnerFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.fromName.toLowerCase().includes(q) || d.itemDescription.toLowerCase().includes(q);
  });

  const activeFiltersCount = (searchQuery ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (partnerFilter !== 'all' ? 1 : 0);
  const totalMatching = (statusFilter === 'pending' ? pendingDocs.length : statusFilter === 'signed' ? signedDocs.length : pendingDocs.length + signedDocs.length);

  const handleSign = (doc: any) => {
    setActiveDoc(doc);
    setShowSignModal(true);
  };

  const handleDeleteClick = (doc: any) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (docToDelete) {
      // The documents subscription in App.tsx removes it from `documents`.
      deleteDocument(docToDelete.id).catch(err => console.error('Could not delete document', err));
      updateLastAction();
      setShowDeleteModal(false);
      setDocToDelete(null);
      setRejectReason('');
      setRejectDetails('');
    }
  };

  const handleSignSubmit = () => {
    if (activeDoc) {
      signDocument(activeDoc.id, new Date().toLocaleDateString('en-GB').replace(/\//g, '-'))
        .catch(err => console.error('Could not sign document', err));
      updateLastAction();
      setShowSignModal(false);
      setActiveDoc(null);
      setIsSigned(false);
      setSignatureSaved(false);
      setDrawnSignature(null);
      setUploadedImage(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Documents Awaiting Signature</h1>
        <p className="text-slate-500">Indicate when you have received items from a community partner.</p>
      </header>

      {/* Filter and Search Bar for Documents (Popup Filter like Search) */}
      <div className="bg-white rounded-[6px] p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search documents by partner, item description, or document title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-medium text-slate-800"
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

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Filters Popup Button */}
            <button 
              type="button"
              onClick={() => setShowFilterModal(true)}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer shadow-none",
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
          </div>
        </div>

        {/* Active Filter Strip */}
        {activeFiltersCount > 0 && (
          <div className="p-3 bg-brand-primary/5 rounded-[6px] border border-brand-primary/20 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mr-1 text-[11px]">
                <Filter size={13} className="text-brand-primary" />
                <span>Active Filters ({activeFiltersCount}):</span>
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-white border border-slate-200 text-slate-800 font-medium text-[11px]">
                  <span>Search: <strong>"{searchQuery}"</strong></span>
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-white border border-brand-primary/30 text-brand-primary font-bold text-[11px]">
                  <span>Status: {statusFilter === 'pending' ? 'Awaiting Signature' : 'Completed & Signed'}</span>
                  <button 
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {partnerFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-white border border-slate-200 text-slate-800 font-medium text-[11px]">
                  <span>Partner: <strong>{partnerFilter}</strong></span>
                  <button 
                    type="button"
                    onClick={() => setPartnerFilter('all')}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <span className="text-slate-600 text-[11px]">
                <strong>{totalMatching}</strong> {totalMatching === 1 ? 'document' : 'documents'}
              </span>
              <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="px-2.5 py-1 rounded bg-white hover:bg-brand-primary/10 text-brand-primary border border-brand-primary/30 text-xs font-bold transition-all cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPartnerFilter('all');
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative bg-white rounded-[6px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">Filter Documents</h3>
                  <p className="text-xs text-slate-500">Filter by signature status and partner organization</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowFilterModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* 1. Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    1. Signature Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All Documents', count: documents.length },
                      { id: 'pending', label: 'Awaiting Signature', count: documents.filter(d => d.status === 'pending').length },
                      { id: 'signed', label: 'Signed', count: documents.filter(d => d.status === 'signed').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={cn(
                          "p-2.5 rounded-[5px] text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer",
                          statusFilter === tab.id
                            ? "bg-brand-primary text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        <span>{tab.label}</span>
                        <span className={cn(
                          "text-[10px] font-normal mt-0.5",
                          statusFilter === tab.id ? "text-white/80" : "text-slate-400"
                        )}>
                          {tab.count} items
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Partner Organization */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Partner Organization
                    </label>
                    {partnerFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setPartnerFilter('all')}
                        className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
                      >
                        Reset to All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPartnerFilter('all')}
                      className={cn(
                        "p-2.5 rounded-[5px] text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer",
                        partnerFilter === 'all'
                          ? "bg-brand-primary text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      <span>All Partners</span>
                      <span className={cn("text-[10px]", partnerFilter === 'all' ? "text-white/80" : "text-slate-400")}>
                        {documents.length}
                      </span>
                    </button>
                    {partnerNames.map(pName => {
                      const count = documents.filter(d => d.fromName === pName).length;
                      const isSelected = partnerFilter === pName;
                      return (
                        <button
                          key={pName}
                          type="button"
                          onClick={() => setPartnerFilter(pName)}
                          className={cn(
                            "p-2.5 rounded-[5px] text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer",
                            isSelected
                              ? "bg-brand-primary text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          )}
                        >
                          <span className="truncate">{pName}</span>
                          <span className={cn("text-[10px] shrink-0 ml-1", isSelected ? "text-white/80" : "text-slate-400")}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setPartnerFilter('all');
                    setSearchQuery('');
                  }}
                  className="py-2.5 px-4 rounded-[5px] font-semibold text-xs text-slate-700 bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-none"
                >
                  Reset
                </button>
                <button 
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-xs transition-all cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>View {totalMatching} {totalMatching === 1 ? 'Document' : 'Documents'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Pending Signatures */}
        {(statusFilter === 'all' || statusFilter === 'pending') && (
          <section className="bg-white rounded-[5px] p-8 shadow-none border border-slate-100">
            <div className="flex justify-between items-center mb-8 gap-4">
              <h2 className="text-lg font-bold text-brand-dark flex-1">
                Pending Signatures ({pendingDocs.length})
              </h2>
              {pendingDocs.length > 2 && (
                <button 
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="text-brand-primary text-sm font-bold hover:underline whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  {showAllPending ? 'Show Less' : 'View More'}
                </button>
              )}
            </div>

            <div className="space-y-6">
              {displayedPendingDocs.map((doc) => (
                <div key={doc.id} className="p-6 rounded-[5px] border border-slate-100 hover:border-brand-primary/20 transition-all bg-white shadow-2xs">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-brand-dark text-lg">{doc.title}</h3>
                        <Tag label="Pending Signature" variant="status-pending" size="sm" />
                        <span className="text-xs text-slate-400">• {doc.timeAgo}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                        <span>From: <strong className="text-brand-dark font-bold">{doc.fromName}</strong></span>
                        <span>To: <strong className="text-brand-dark font-bold">{doc.toName}</strong></span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">Your signature indicates that you have received the {doc.itemDescription}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Tag label={doc.itemDescription} variant="category" size="sm" />
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-bold",
                          (doc.dueDate ?? '').toLowerCase().includes('tomorrow') ? "text-red-500" : "text-brand-primary"
                        )}>
                          <Calendar size={13} />
                          <span>Due: {doc.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    {/* Clear Button Hierarchy: Primary (Sign), Secondary (View), Destructive Ghost (Reject) */}
                    <div className="flex flex-col gap-2 justify-center w-full sm:w-auto shrink-0">
                      <button 
                        onClick={() => handleSign(doc)}
                        className="w-full py-2.5 px-6 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-xs transition-all shadow-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Pencil size={13} />
                        <span>Sign Document</span>
                      </button>
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => console.log('Viewing document:', doc.id)}
                          className="flex-1 py-2 px-3 flex justify-center items-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[5px] transition-all text-xs font-semibold cursor-pointer shadow-none"
                          title="View document"
                        >
                          <Eye size={14} className="mr-1 text-slate-500" />
                          <span>Preview</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(doc)}
                          className="py-2 px-3 flex justify-center items-center hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-[5px] transition-all text-xs font-semibold cursor-pointer shadow-none"
                          title="Reject document request"
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {pendingDocs.length === 0 && (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-[5px] text-slate-400 text-xs">
                  No pending documents found matching your search.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Signed Documents */}
        {(statusFilter === 'all' || statusFilter === 'signed') && (
          <section className="bg-white rounded-[5px] p-8 shadow-none border border-slate-100">
            <h2 className="text-lg font-bold text-brand-dark mb-6">
              Signed Documents ({signedDocs.length})
            </h2>
            
            <div className="space-y-6">
              {signedDocs.map((doc) => (
                <div key={doc.id} className="p-6 rounded-[5px] border border-slate-100 bg-slate-50/40">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-brand-dark text-lg">{doc.title}</h3>
                        <Tag label={`Signed ${doc.signedDate || ''}`.trim()} variant="status-approved" size="sm" />
                        <span className="text-xs text-slate-400">• {doc.timeAgo}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                        <span>From: <strong className="text-brand-dark font-bold">{doc.fromName}</strong></span>
                        <span>To: <strong className="text-brand-dark font-bold">{doc.toName}</strong></span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">Your signature indicates that you have received the {doc.itemDescription}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag label={doc.itemDescription} variant="category" size="sm" />
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold ml-2">
                          <Check size={14} />
                          <span>Signed on {doc.signedDate}</span>
                        </div>
                      </div>
                    </div>
                    {/* Secondary Hierarchy Button */}
                    <div className="flex flex-col justify-center shrink-0">
                      <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[5px] text-xs font-bold transition-all shadow-none cursor-pointer">
                        <Download size={14} className="text-slate-500" />
                        <span>Download Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {signedDocs.length === 0 && (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-[5px] text-slate-400 text-xs">
                  No signed documents found matching your search.
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Signing Modal */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-dark">Documents Awaiting Signature</h3>
                <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div>
                  <h4 className="font-bold text-brand-primary text-sm mb-2">{activeDoc?.title}</h4>
                  <p className="text-sm text-slate-500">Your signature indicates that you have received the {activeDoc?.itemDescription}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold text-slate-700">
                      {signMethod === 'type' ? 'Typed Signature*' : 'Drawn Signature*'}
                    </label>
                    <button 
                      onClick={() => setSignMethod(signMethod === 'type' ? 'draw' : 'type')}
                      className="text-xs font-bold text-brand-primary hover:underline"
                    >
                      {signMethod === 'type' ? 'Manually Sign Instead' : 'Type Signature Instead'}
                    </button>
                  </div>

                  {signMethod === 'type' ? (
                    <input 
                      type="text" 
                      placeholder="Jane Doe" 
                      className="w-full px-4 py-3 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  ) : (
                    <div className="space-y-4">
                      {drawnSignature ? (
                        <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-[5px] relative flex flex-col items-center justify-center overflow-hidden">
                          <img src={drawnSignature} alt="Signature" className="max-h-full object-contain" />
                          <div className="absolute bottom-4 right-4 flex gap-2">
                            <button 
                              onClick={() => {
                                setDrawnSignature(null);
                                setIsSigned(false);
                                setSignatureSaved(false);
                              }}
                              className="px-4 py-1.5 border border-slate-200 bg-white rounded-[5px] text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                              Clear
                            </button>
                          </div>
                          {signatureSaved && <span className="absolute top-4 right-4 text-[10px] text-green-600 font-bold flex items-center gap-1"><Check size={10}/> Signature Saved</span>}
                        </div>
                      ) : (
                        <SignatureCanvas 
                          onSave={(dataUrl) => {
                            setDrawnSignature(dataUrl);
                            setIsSigned(true);
                            setSignatureSaved(true);
                          }}
                          onClear={() => {
                            setDrawnSignature(null);
                            setIsSigned(false);
                            setSignatureSaved(false);
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">Upload Image of Received Items*</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUploadedImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {uploadedImage ? (
                    <div className="relative w-full h-48 rounded-[5px] overflow-hidden border border-slate-200 group">
                      <img src={uploadedImage} alt="Uploaded items" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white rounded-full text-brand-primary hover:bg-slate-50 transition-colors"
                        >
                          <Pencil size={20} />
                        </button>
                        <button 
                          onClick={() => setUploadedImage(null)}
                          className="p-2 bg-white rounded-full text-red-500 hover:bg-slate-50 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-slate-200 rounded-[5px] flex flex-col items-center justify-center p-8 text-center group hover:border-brand-primary/40 transition-all cursor-pointer"
                    >
                      <Upload className="text-slate-300 mb-4 group-hover:text-brand-primary transition-colors" size={32} />
                      <p className="text-slate-400 text-sm mb-2">Drag files here or</p>
                      <button className="px-6 py-2 border border-slate-200 rounded-[5px] text-sm font-bold text-slate-700 hover:bg-slate-50">Choose A File</button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-brand-secondary/30 rounded-[5px] text-center">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    By signing the following document, you are indicating that you have successfully received your materials from the community partner.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="save-sig" className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                  <label htmlFor="save-sig" className="text-sm font-bold text-slate-700">Save Signature For Future Documents</label>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex justify-end">
                <button 
                  onClick={handleSignSubmit}
                  className="px-12 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold transition-all"
                >
                  Sign & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <div className="flex items-center gap-4 text-red-600 mb-6">
                <Ban size={24} />
                <h3 className="text-xl font-bold">Reject Document Request?</h3>
              </div>
              
              <div className="space-y-6 mb-8">
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to remove the document request for <span className="font-bold text-brand-dark">{docToDelete?.fromName}</span>?
                </p>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reason for rejection*</label>
                  <div className="relative">
                    <select 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm appearance-none bg-white pr-10"
                    >
                      <option value="">Select a reason...</option>
                      <option value="no-response">Received no response</option>
                      <option value="unavailable">Supplies no longer available</option>
                      <option value="credibility">Lack of credibility</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Additional Details (Optional)</label>
                  <textarea 
                    value={rejectDetails}
                    onChange={(e) => setRejectDetails(e.target.value)}
                    placeholder="Provide more context for the team..."
                    className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[100px] text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRejectReason('');
                    setRejectDetails('');
                  }}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-[5px] font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={!rejectReason}
                  className={cn(
                    "flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-[5px] font-bold transition-all",
                    !rejectReason && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
