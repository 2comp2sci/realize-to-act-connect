import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, Mail, Phone, MapPin, Backpack, 
  Package, Sparkles, Shirt, Utensils, BookOpen, 
  Truck, CheckCircle2, ChevronRight, ChevronDown, 
  Plus, Minus, ExternalLink, HelpCircle, AlertCircle, Info, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SchoolResourceRequest, ConnectionRequest, User } from '../types';

interface SchoolRequestFormProps {
  user: User;
  onSubmitSuccess: (newRequest: ConnectionRequest) => void;
  onCancel: () => void;
}

export default function SchoolRequestForm({ user, onSubmitSuccess, onCancel }: SchoolRequestFormProps) {
  // Section 1: School & District Information
  const [schoolName, setSchoolName] = useState(user.name || 'Midland Public Schools');
  const [contactName, setContactName] = useState(user.contactName || 'Jane Doe');
  const [contactRole, setContactRole] = useState(user.contactRole || 'Resource Coordinator');
  const [email, setEmail] = useState(user.email || 'jdoe@schooldistrict.edu');
  const [phone, setPhone] = useState(user.phone || '(555) 234-5678');
  const [state, setState] = useState(user.state || 'Michigan');
  const [requestScope, setRequestScope] = useState<'district' | 'school'>('school');
  const [districtSchoolsCount, setDistrictSchoolsCount] = useState<number>(4);
  const [districtStudentsCount, setDistrictStudentsCount] = useState<number>(2400);
  const [schoolStudentsCount, setSchoolStudentsCount] = useState<number>(550);
  const [expectedStudentsInNeed, setExpectedStudentsInNeed] = useState<number>(180);

  // Active accordion step (1: Info, 2: Categories, 3: Specs, 4: Logistics)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Section 2: Selected Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Backpacks',
    'School Supplies',
    'Hygiene Products'
  ]);

  // Section 3: Backpacks Details
  const [backpackGradeBands, setBackpackGradeBands] = useState<string[]>(['K - 2nd Grade', '3rd - 5th Grade']);
  const [solidBackpackQty, setSolidBackpackQty] = useState<number>(100);
  const [clearBackpackQty, setClearBackpackQty] = useState<number>(50);
  const [mandateStatus, setMandateStatus] = useState<string>('No mandate');

  // Section 3: School Supplies Details
  const [packagedKits, setPackagedKits] = useState<boolean>(true);
  const [kitPackagingPreference, setKitPackagingPreference] = useState<string>('Pre-packed inside backpacks');
  const [suppliesItems, setSuppliesItems] = useState<{ [key: string]: number }>({
    'Wide-Ruled Spiral Notebooks': 150,
    'College-Ruled Spiral Notebooks': 100,
    'Composition Books': 120,
    'No. 2 Wood Pencils (Packs of 12)': 150,
    'Colored Pencils (12-pack)': 120,
    'Washable Broad Line Markers (8-10 count)': 100,
    '24-Pack Crayola Crayons': 120,
    'Glue Sticks (Disappearing Purple)': 200,
    'Pink Bevel Erasers (3-pack)': 100,
    'Over-Ear Student Headphones (3.5mm)': 80,
    'Two-Pocket Heavy Duty Folders': 250,
    'Rulers (12-inch standard/metric)': 90
  });
  const [supplyDeliveryMethod, setSupplyDeliveryMethod] = useState<string>('Packed inside backpacks for back-to-school kickoff');

  // Section 3: Hygiene Details
  const [hygieneItems, setHygieneItems] = useState<{ [key: string]: number }>({
    'Deodorant (Stick / Spray)': 120,
    'Menstrual Pads & Tampons (Boxes)': 80,
    'Facial Tissue Pocket Packs': 200,
    'Toothbrush & Toothpaste Kits': 150,
    'Lip Balm / Chapstick': 100,
    'Pocket Hand Sanitizers': 180
  });
  const [sprayDeodorant, setSprayDeodorant] = useState(true);
  const [stickDeodorant, setStickDeodorant] = useState(true);
  const [pads, setPads] = useState(true);
  const [tampons, setTampons] = useState(true);
  const [hygieneGradeBands, setHygieneGradeBands] = useState<string[]>(['Middle School', 'High School']);

  // Section 3: Cleaning Supplies Details
  const [cleaningItems, setCleaningItems] = useState<{ [key: string]: number }>({
    'Disinfecting Surface Wipes (Canisters)': 40,
    'Paper Towel Rolls (Multi-packs)': 25,
    'Disinfecting Multi-Surface Spray Bottles': 30,
    'Gentle Baby Wipes (Boxes)': 35,
    'Classroom Hand Sanitizer Pump Jugs': 20
  });

  // Section 3: Clothing Details
  const [garmentTypes, setGarmentTypes] = useState<string[]>(['T-Shirts', 'Hoodies', 'Winter Coats', 'Socks']);
  const [kidsSizes, setKidsSizes] = useState<string[]>(['Youth S', 'Youth M', 'Youth L']);
  const [adultSizes, setAdultSizes] = useState<string[]>(['Adult S', 'Adult M', 'Adult L']);
  const [shoeSizes, setShoeSizes] = useState<string[]>(['Youth 1 - 4', 'Adult 7 - 10']);

  // Section 3: Food & Pantry Details
  const [foodSnacks, setFoodSnacks] = useState<string[]>([
    'Granola Bars',
    'Fruit Snacks',
    'Goldfish & Cheese Crackers'
  ]);
  const [foodNonperishables, setFoodNonperishables] = useState<string[]>([
    'Microwaveable Mac & Cheese Cups',
    'Canned Soups & Stews',
    'Canned Fruit Pouches'
  ]);
  const [foodFrozen, setFoodFrozen] = useState<string[]>(['Waffles & Pancakes']);

  // Section 3: Enrichment Details
  const [timeForKids, setTimeForKids] = useState(true);
  const [whatSparksYouWorkshop, setWhatSparksYouWorkshop] = useState(true);
  const [stemKits, setStemKits] = useState(true);
  const [enrichmentNotes, setEnrichmentNotes] = useState('Interested in 3rd to 5th grade Service Stars magazine distribution.');

  // Section 4: Logistics Details
  const [logisticsMethod, setLogisticsMethod] = useState<string>('Realize to Act volunteer drop-off direct to school');
  const [eventDate, setEventDate] = useState<string>('Late August, before school year begins');
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Main office entrance or back loading dock door #3. Check in with reception or facilities coordinator.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<SchoolResourceRequest | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleUpdateSupplyQty = (item: string, delta: number) => {
    setSuppliesItems(prev => {
      const current = prev[item] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [item]: updated };
    });
  };

  const handleUpdateHygieneQty = (item: string, delta: number) => {
    setHygieneItems(prev => {
      const current = prev[item] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [item]: updated };
    });
  };

  const handlePreFillSample = () => {
    setSchoolName('Midland Community School District');
    setContactName('Marcus Vance');
    setContactRole('District Student Services Director');
    setEmail('mvance@midlandps.org');
    setPhone('(989) 555-0142');
    setState('Michigan');
    setRequestScope('district');
    setDistrictSchoolsCount(6);
    setDistrictStudentsCount(3200);
    setExpectedStudentsInNeed(350);
    setSelectedCategories([
      'Backpacks',
      'School Supplies',
      'Hygiene Products',
      'Cleaning Supplies',
      'Food & Pantry',
      'Service & Science Enrichment'
    ]);
    setSolidBackpackQty(220);
    setClearBackpackQty(130);
    setBackpackGradeBands(['K - 2nd Grade', '3rd - 5th Grade', '6th - 8th Grade']);
    setMandateStatus('In the process of implementing for 6th-12th');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullRequestData: SchoolResourceRequest = {
      id: `req-${Date.now()}`,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      schoolName,
      contactName,
      contactRole,
      email,
      phone,
      state,
      requestScope,
      districtSchoolsCount: requestScope === 'district' ? districtSchoolsCount : undefined,
      districtStudentsCount: requestScope === 'district' ? districtStudentsCount : undefined,
      schoolStudentsCount: requestScope === 'school' ? schoolStudentsCount : undefined,
      expectedStudentsInNeed,
      selectedCategories,
      backpacks: selectedCategories.includes('Backpacks') ? {
        gradeBands: backpackGradeBands,
        solidQty: solidBackpackQty,
        clearQty: clearBackpackQty,
        mandateStatus
      } : undefined,
      schoolSupplies: selectedCategories.includes('School Supplies') ? {
        packagedKits,
        kitPackagingPreference,
        items: suppliesItems,
        deliveryMethod: supplyDeliveryMethod
      } : undefined,
      hygiene: selectedCategories.includes('Hygiene Products') ? {
        items: hygieneItems,
        sprayDeodorant,
        stickDeodorant,
        pads,
        tampons,
        gradeBands: hygieneGradeBands
      } : undefined,
      cleaning: selectedCategories.includes('Cleaning Supplies') ? {
        items: cleaningItems
      } : undefined,
      clothing: selectedCategories.includes('Clothing & Apparel') ? {
        garmentTypes,
        kidsSizes,
        adultSizes,
        shoeSizes
      } : undefined,
      food: selectedCategories.includes('Food & Pantry') ? {
        categories: ['Snacks', 'Nonperishables', 'Cold Reheatables'],
        snacks: foodSnacks,
        nonperishables: foodNonperishables,
        frozen: foodFrozen
      } : undefined,
      enrichment: selectedCategories.includes('Service & Science Enrichment') ? {
        timeForKids,
        whatSparksYouWorkshop,
        stemKits,
        notes: enrichmentNotes
      } : undefined,
      logistics: {
        method: logisticsMethod,
        eventDate,
        specialInstructions
      }
    };

    const newConnectionRequest: ConnectionRequest = {
      id: `sent-${Date.now()}`,
      fromId: user.id || 'user-1',
      fromName: schoolName,
      fromAvatar: user.avatar || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop',
      type: 'sent',
      status: 'pending',
      item: selectedCategories.slice(0, 3).join(', ') + (selectedCategories.length > 3 ? ` +${selectedCategories.length - 3} more` : ''),
      quantity: expectedStudentsInNeed,
      distance: 'Local District Hub',
      timeAgo: 'Just now',
      timestamp: Date.now(),
      description: `Official school resource request filed for ${expectedStudentsInNeed} students in need. Categories requested: ${selectedCategories.join(', ')}.`,
      schoolRequestData: fullRequestData
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData(fullRequestData);
      setShowSuccessModal(true);
      onSubmitSuccess(newConnectionRequest);
    }, 600);
  };

  const categoriesList = [
    { id: 'Backpacks', label: 'Backpacks', icon: Backpack, desc: 'Solid color & clear transparent bags' },
    { id: 'School Supplies', label: 'School Supplies', icon: Package, desc: 'Pre-packaged kits & bulk supplies' },
    { id: 'Hygiene Products', label: 'Hygiene Products', icon: Sparkles, desc: 'Deodorant, menstrual care & essentials' },
    { id: 'Cleaning Supplies', label: 'Cleaning & Sanitation', icon: RefreshCw, desc: 'Wipes, paper towels & disinfectants' },
    { id: 'Clothing & Apparel', label: 'Clothing & Apparel', icon: Shirt, desc: 'Uniforms, coats, socks & shoes' },
    { id: 'Food & Pantry', label: 'Food & Nutrition', icon: Utensils, desc: 'Student snacks & shelf-stable food' },
    { id: 'Service & Science Enrichment', label: 'Enrichment Programs', icon: BookOpen, desc: 'TIME for Kids, STEM Kits & workshops' }
  ];

  return (
    <div className="bg-white rounded-[6px] border border-slate-200 overflow-hidden shadow-xs">
      {/* School Resource Request Header matching site design */}
      <div className="bg-white border-b border-slate-200 p-6 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Resource Partnership</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500">School Request Manifest</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark tracking-tight">
                School Resource Request Form
              </h1>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
                Request supplies and essential items for your school or district. Select which resources you need for your students, specify grade bands, customize kit contents, and configure delivery logistics.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePreFillSample}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-[5px] text-xs font-bold transition-all shadow-none"
              >
                <Sparkles size={14} className="text-brand-primary" />
                Pre-fill Sample Data
              </button>
              <a
                href="https://canva.link/2caz0yr74vsu469"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-[5px] text-xs font-bold transition-all shadow-none"
              >
                Resource Catalog <ExternalLink size={12} className="text-slate-400" />
              </a>
            </div>
          </div>

          {/* Stepper Navigation Tracker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-slate-100">
            {[
              { num: 1, title: '1. School Information', summary: schoolName ? `${schoolName.slice(0, 24)}...` : 'District profile' },
              { num: 2, title: '2. Resource Categories', summary: `${selectedCategories.length} categories selected` },
              { num: 3, title: '3. Item Specifications', summary: 'Kit & grade configurations' },
              { num: 4, title: '4. Delivery & Review', summary: eventDate ? eventDate.slice(0, 20) : 'Logistics plan' }
            ].map(stepItem => {
              const isCurrent = activeStep === stepItem.num;
              const isCompleted = activeStep > stepItem.num;
              return (
                <button
                  key={stepItem.num}
                  type="button"
                  onClick={() => setActiveStep(stepItem.num)}
                  className={cn(
                    "p-3 rounded-[5px] border text-left transition-all",
                    isCurrent 
                      ? "border-brand-primary bg-brand-secondary/15 ring-1 ring-brand-primary" 
                      : isCompleted
                      ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-bold",
                      isCurrent ? "text-brand-dark" : isCompleted ? "text-emerald-800" : "text-slate-600"
                    )}>
                      {stepItem.title}
                    </span>
                    {isCompleted && <CheckCircle2 size={13} className="text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">{stepItem.summary}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Step 1: School & District Information Accordion */}
        <section className="border border-slate-200 rounded-[6px] overflow-hidden bg-white shadow-xs">
          <button
            type="button"
            onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
            className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                activeStep === 1 
                  ? "bg-brand-primary text-white" 
                  : (schoolName && contactName) 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-slate-100 text-slate-600"
              )}>
                {schoolName && contactName && activeStep !== 1 ? <CheckCircle2 size={16} /> : 1}
              </span>
              <div>
                <h2 className="text-lg font-serif font-bold text-brand-dark">School & District Information</h2>
                {activeStep !== 1 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {schoolName} • {contactName} ({contactRole}) • {state} • {expectedStudentsInNeed} students in need
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeStep !== 1 && (
                <span className="text-xs font-semibold text-brand-primary">Edit</span>
              )}
              {activeStep === 1 ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
            </div>
          </button>

          {activeStep === 1 && (
            <div className="p-6 pt-0 space-y-6 border-t border-slate-100 mt-2">
              <div className="border-b border-slate-100 pb-3 pt-4">
                <p className="text-xs text-slate-500">Provide verified contact details and scope of student enrollment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    School or District Name*
                  </label>
                  <input 
                    type="text" 
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Midland High School / Midland Public Schools"
                    className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                  />
                </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Contact Person*
              </label>
              <input 
                type="text" 
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contact Title / Role*
              </label>
              <input 
                type="text" 
                required
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="Principal, Counselor, Resource Coordinator, Admin..."
                className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email Address*
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@schooldistrict.edu"
                className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number*
              </label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                State*
              </label>
              <input 
                type="text" 
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Michigan, Ohio, Illinois..."
                className="w-full px-4 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
              />
            </div>
          </div>

          {/* Conditional Scope */}
          <div className="bg-slate-50 p-5 rounded-[6px] border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Are you requesting on behalf of a full School District or one specific School?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRequestScope('district')}
                  className={cn(
                    "py-3 px-4 rounded-[5px] text-sm font-bold border transition-all text-center",
                    requestScope === 'district'
                      ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-brand-primary/40"
                  )}
                >
                  Full School District
                </button>
                <button
                  type="button"
                  onClick={() => setRequestScope('school')}
                  className={cn(
                    "py-3 px-4 rounded-[5px] text-sm font-bold border transition-all text-center",
                    requestScope === 'school'
                      ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-brand-primary/40"
                  )}
                >
                  One Specific School Building
                </button>
              </div>
            </div>

            {requestScope === 'district' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    How many schools are in the district?
                  </label>
                  <input 
                    type="number"
                    min={1}
                    value={districtSchoolsCount}
                    onChange={(e) => setDistrictSchoolsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-[5px] bg-white border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Total students across the school district?
                  </label>
                  <input 
                    type="number"
                    min={1}
                    value={districtStudentsCount}
                    onChange={(e) => setDistrictStudentsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-[5px] bg-white border border-slate-200 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  How many students are enrolled in your school building?
                </label>
                <input 
                  type="number"
                  min={1}
                  value={schoolStudentsCount}
                  onChange={(e) => setSchoolStudentsCount(parseInt(e.target.value) || 1)}
                  className="w-full sm:w-1/2 px-3 py-2 rounded-[5px] bg-white border border-slate-200 text-sm"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                How many students do you expect to need material resources over the school year?*
              </label>
              <p className="text-xs text-slate-500 mb-2">Estimate the total student population needing assistance.</p>
              <input 
                type="number"
                required
                min={1}
                value={expectedStudentsInNeed}
                onChange={(e) => setExpectedStudentsInNeed(parseInt(e.target.value) || 1)}
                className="w-full sm:w-1/3 px-4 py-2.5 rounded-[5px] bg-white border border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20 text-base font-bold text-brand-dark"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-6 py-2.5 rounded-[5px] bg-brand-primary text-white text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-2"
            >
              Continue to Step 2: Resource Categories
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </section>

    {/* Step 2: Resource Categories Selection Accordion */}
    <section className="border border-slate-200 rounded-[6px] overflow-hidden bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            activeStep === 2 
              ? "bg-brand-primary text-white" 
              : selectedCategories.length > 0 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-slate-100 text-slate-600"
          )}>
            {selectedCategories.length > 0 && activeStep !== 2 ? <CheckCircle2 size={16} /> : 2}
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-brand-dark">Resource Category Selection</h2>
            {activeStep !== 2 && (
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'No categories selected'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeStep !== 2 && (
            <span className="text-xs font-semibold text-brand-primary">Edit</span>
          )}
          {activeStep === 2 ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </div>
      </button>

      {activeStep === 2 && (
        <div className="p-6 pt-0 space-y-6 border-t border-slate-100 mt-2">
          <p className="text-xs text-slate-500 pt-4">Select which resources you need for your students (select all that apply):</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "p-4 rounded-[6px] border cursor-pointer transition-all flex items-start gap-3 select-none",
                    isSelected
                      ? "border-brand-primary bg-brand-secondary/15 ring-1 ring-brand-primary"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center mt-0.5 transition-colors",
                    isSelected ? "bg-brand-primary text-white" : "border border-slate-300 bg-white"
                  )}>
                    {isSelected && <CheckCircle2 size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Icon size={16} className={isSelected ? "text-brand-primary" : "text-slate-400"} />
                      <h3 className="text-sm font-bold text-slate-900">{cat.label}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2.5 rounded-[5px] border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              ← Back to Step 1
            </button>
            <button
              type="button"
              disabled={selectedCategories.length === 0}
              onClick={() => setActiveStep(3)}
              className="px-6 py-2.5 rounded-[5px] bg-brand-primary text-white text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-2 disabled:opacity-50"
            >
              Continue to Step 3: Detailed Specifications ({selectedCategories.length} Categories)
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </section>

    {/* Step 3: Conditional Resource Specifications Accordion */}
    <section className="border border-slate-200 rounded-[6px] overflow-hidden bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            activeStep === 3 
              ? "bg-brand-primary text-white" 
              : selectedCategories.length > 0 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-slate-100 text-slate-600"
          )}>
            {selectedCategories.length > 0 && activeStep > 3 ? <CheckCircle2 size={16} /> : 3}
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-brand-dark">Detailed Resource Specifications</h2>
            {activeStep !== 3 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Kit and grade configurations specified for {selectedCategories.length} resource categories
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeStep !== 3 && (
            <span className="text-xs font-semibold text-brand-primary">Edit</span>
          )}
          {activeStep === 3 ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </div>
      </button>

      {activeStep === 3 && (
        <div className="p-6 pt-0 space-y-6 border-t border-slate-100 mt-2">
          <div className="border-b border-slate-100 pb-3 pt-4">
            <p className="text-xs text-slate-500">Customize sizes, quantities, packaging and fulfillment preferences for your selected resources.</p>
          </div>

          {/* BACKPACKS SECTION */}
          {selectedCategories.includes('Backpacks') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-5"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Backpack className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">Backpacks Specifications</h3>
              </div>

              {/* Grade Bands */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  What grade bands will receive backpacks?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Kindergarten - 2nd Grade', '3rd - 5th Grade', '6th - 8th Grade', '9th - 12th Grade'].map(gb => {
                    const isSelected = backpackGradeBands.includes(gb);
                    return (
                      <button
                        type="button"
                        key={gb}
                        onClick={() => {
                          setBackpackGradeBands(prev => 
                            prev.includes(gb) ? prev.filter(g => g !== gb) : [...prev, gb]
                          );
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-[5px] text-xs font-bold border transition-all",
                          isSelected 
                            ? "bg-brand-primary text-white border-brand-primary" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {gb}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantities Solid vs Clear */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-[5px]">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Solid Color Backpacks (15" & 17")
                  </label>
                  <input 
                    type="number"
                    min={0}
                    value={solidBackpackQty}
                    onChange={(e) => setSolidBackpackQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-[5px] bg-white border border-slate-200 text-sm font-semibold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Standard durable polyester canvas</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clear Transparent Backpacks (17")
                  </label>
                  <input 
                    type="number"
                    min={0}
                    value={clearBackpackQty}
                    onChange={(e) => setClearBackpackQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-[5px] bg-white border border-slate-200 text-sm font-semibold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Heavy-duty clear PVC with reinforced stitching</span>
                </div>
              </div>

              {/* Clear Backpack Mandate Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Does your school or district have a clear backpack mandate?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'No mandate',
                    'Yes, required for all students (K-12)',
                    'Yes, required for older students (Middle & High)',
                    'In the process of implementing this school year'
                  ].map(option => (
                    <label 
                      key={option} 
                      className={cn(
                        "p-3 rounded-[5px] border flex items-center gap-2 cursor-pointer transition-all",
                        mandateStatus === option ? "border-brand-primary bg-brand-secondary/15 font-semibold text-brand-dark" : "border-slate-200 text-slate-600"
                      )}
                    >
                      <input 
                        type="radio" 
                        name="mandateStatus"
                        value={option}
                        checked={mandateStatus === option}
                        onChange={(e) => setMandateStatus(e.target.value)}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCHOOL SUPPLIES SECTION */}
          {selectedCategories.includes('School Supplies') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-5"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Package className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">School Supplies Kit Customizer</h3>
              </div>

              {/* Packaged Kits Toggle */}
              <div className="bg-slate-50 p-4 rounded-[5px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Would you prefer individually pre-packaged kits?</h4>
                  <p className="text-xs text-slate-500">Kits can be bundled directly into individual student bags or delivered in bulk classroom bins.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPackagedKits(true)}
                    className={cn(
                      "px-3 py-1.5 rounded-[5px] text-xs font-bold border transition-all",
                      packagedKits ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    Yes, Pre-packaged
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackagedKits(false)}
                    className={cn(
                      "px-3 py-1.5 rounded-[5px] text-xs font-bold border transition-all",
                      !packagedKits ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    Bulk Distribution
                  </button>
                </div>
              </div>

              {/* Kit Items Catalog with Quantity Adjusters */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Supplies Manifest & Item Quantities
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {Object.entries(suppliesItems).map(([item, qty]) => (
                    <div key={item} className="flex items-center justify-between p-2.5 rounded-[5px] bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-medium text-slate-700 pr-2">{item}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateSupplyQty(item, -25)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-12 text-center font-bold text-slate-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateSupplyQty(item, 25)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* HYGIENE PRODUCTS SECTION */}
          {selectedCategories.includes('Hygiene Products') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-5"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">Hygiene & Wellness Distribution</h3>
              </div>

              {/* Items with Quantities */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Hygiene Essentials & Quantities
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {Object.entries(hygieneItems).map(([item, qty]) => (
                    <div key={item} className="flex items-center justify-between p-2.5 rounded-[5px] bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-medium text-slate-700 pr-2">{item}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateHygieneQty(item, -20)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-12 text-center font-bold text-slate-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateHygieneQty(item, 20)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-item Preferences */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={sprayDeodorant}
                    onChange={(e) => setSprayDeodorant(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <span>Spray Deodorant</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={stickDeodorant}
                    onChange={(e) => setStickDeodorant(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <span>Stick Deodorant</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pads}
                    onChange={(e) => setPads(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <span>Menstrual Pads</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tampons}
                    onChange={(e) => setTampons(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <span>Tampons</span>
                </label>
              </div>
            </motion.div>
          )}

          {/* CLEANING SUPPLIES SECTION */}
          {selectedCategories.includes('Cleaning Supplies') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <RefreshCw className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">Classroom Sanitation & Disinfection</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {Object.entries(cleaningItems).map(([item, qty]) => (
                  <div key={item} className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">{item}</span>
                    <span className="font-bold text-slate-900">{qty} units</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CLOTHING SECTION */}
          {selectedCategories.includes('Clothing & Apparel') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shirt className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">Clothing & Apparel Specifications</h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Garments Needed
                </label>
                <div className="flex flex-wrap gap-2">
                  {['T-Shirts', 'Jeans / Pants', 'Uniform Polos', 'Winter Coats', 'Hoodies', 'Underwear Packs', 'Athletic Socks', 'Shoes'].map(g => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGarmentTypes(prev => prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g])}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-semibold border transition-all",
                        garmentTypes.includes(g) ? "bg-brand-primary text-white border-brand-primary" : "bg-slate-50 text-slate-600 border-slate-200"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* FOOD & PANTRY SECTION */}
          {selectedCategories.includes('Food & Pantry') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Utensils className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">Student Food & Pantry Program</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Classroom Snacks</span>
                  <p className="text-slate-600">{foodSnacks.join(', ')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Weekend Meal Staples</span>
                  <p className="text-slate-600">{foodNonperishables.join(', ')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Reheatable / Cold</span>
                  <p className="text-slate-600">{foodFrozen.join(', ')}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SERVICE & SCIENCE ENRICHMENT */}
          {selectedCategories.includes('Service & Science Enrichment') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[6px] border border-slate-200 bg-white space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BookOpen className="text-brand-primary" size={20} />
                <h3 className="font-serif font-bold text-lg text-brand-dark">Realize to Act Enrichment Programs</h3>
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded bg-slate-50 border border-slate-100 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={timeForKids}
                    onChange={(e) => setTimeForKids(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">TIME for Kids Service Stars Magazine Subscriptions</span>
                    <span className="text-slate-500">Inspiring service learning stories for Grades K - 6.</span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded bg-slate-50 border border-slate-100 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={whatSparksYouWorkshop}
                    onChange={(e) => setWhatSparksYouWorkshop(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">"What Sparks You" Student Growth & Service Workshop</span>
                    <span className="text-slate-500">Interactive curriculum helping students find passions to impact the world.</span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded bg-slate-50 border border-slate-100 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={stemKits}
                    onChange={(e) => setStemKits(e.target.checked)}
                    className="rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">STEM Kits with DIY Hoop Glider Project</span>
                    <span className="text-slate-500">Hands-on aerodynamics activity kit for every student.</span>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2.5 rounded-[5px] border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              ← Back to Step 2
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-6 py-2.5 rounded-[5px] bg-brand-primary text-white text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-2"
            >
              Continue to Step 4: Delivery & Logistics
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </section>

    {/* Step 4: Delivery, Logistics & Review Accordion */}
    <section className="border border-slate-200 rounded-[6px] overflow-hidden bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setActiveStep(activeStep === 4 ? 0 : 4)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            activeStep === 4 ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-600"
          )}>
            4
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-brand-dark">Fulfillment Logistics & Final Review</h2>
            {activeStep !== 4 && (
              <p className="text-xs text-slate-500 mt-0.5">
                {logisticsMethod} • {eventDate || 'Standard delivery timeframe'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeStep !== 4 && (
            <span className="text-xs font-semibold text-brand-primary">Edit</span>
          )}
          {activeStep === 4 ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </div>
      </button>

      {activeStep === 4 && (
        <div className="p-6 pt-0 space-y-6 border-t border-slate-100 mt-2">
          <div className="border-b border-slate-100 pb-3 pt-4">
            <p className="text-xs text-slate-500">Coordinate delivery schedules, unloading docks, and recipient instructions.</p>
          </div>

          {/* LOGISTICS & DELIVERY PREFERENCES */}
          <div className="p-5 rounded-[6px] border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Truck className="text-brand-primary" size={18} />
              <h3 className="font-serif font-bold text-base text-brand-dark">Fulfillment & Drop-off Plan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Delivery Method Preference*
                </label>
                <select
                  value={logisticsMethod}
                  onChange={(e) => setLogisticsMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] bg-white border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <option value="Realize to Act volunteer drop-off direct to school">Realize to Act volunteer drop-off direct to school</option>
                  <option value="Delivery at Back-to-School Kickoff Event (July/August)">Delivery at Back-to-School Kickoff Event (July/August)</option>
                  <option value="School pickup from community partner distribution center">School pickup from community partner distribution center</option>
                  <option value="Staged monthly deliveries throughout academic year">Staged monthly deliveries throughout academic year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Delivery Date / Event Window
                </label>
                <input 
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. August 20-25th, before teacher orientation"
                  className="w-full px-3 py-2.5 rounded-[5px] bg-white border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Special Delivery, Loading Dock, or Reception Instructions
              </label>
              <textarea 
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Loading dock access door #4, buzzer 102, ask for Marcus..."
                className="w-full px-3 py-2 rounded-[5px] bg-white border border-slate-200 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Review Summary Box */}
          <div className="p-4 rounded-[6px] border border-brand-primary/20 bg-brand-secondary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-brand-dark block">Request Summary</span>
              <span className="text-slate-600">
                {schoolName} • {selectedCategories.length} categories selected • Supporting {expectedStudentsInNeed} students
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white rounded border border-brand-primary/30 font-semibold text-brand-dark">
                {selectedCategories.join(', ')}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-[5px] border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              ← Back to Step 3
            </button>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-[5px] border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Cancel & Return
              </button>

              <button
                type="submit"
                disabled={isSubmitting || selectedCategories.length === 0}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-[5px] bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs transition-all shadow-none",
                  (isSubmitting || selectedCategories.length === 0) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Submitting Manifest...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit School Resource Request ({expectedStudentsInNeed} Students)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
      </form>

      {/* Success Confirmation Modal */}
      <AnimatePresence>
        {showSuccessModal && submittedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[6px] shadow-2xl p-8 max-w-lg w-full text-center border border-slate-200"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">
                Request Successfully Submitted!
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Your school resource request for <strong className="text-slate-900">{submittedData.expectedStudentsInNeed} students</strong> has been broadcast across the Realize to Act network. Community partners will be notified to coordinate drop-offs.
              </p>
              <div className="bg-slate-50 p-4 rounded text-left text-xs space-y-1.5 border border-slate-100 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Institution:</span>
                  <span className="font-bold text-slate-800">{submittedData.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Categories Included:</span>
                  <span className="font-bold text-slate-800">{submittedData.selectedCategories.length} categories</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Logistics Method:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{submittedData.logistics?.method}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onCancel();
                }}
                className="w-full py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] font-bold text-sm transition-all"
              >
                View in Sent Requests
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
