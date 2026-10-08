import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Truck, Users, Clock, MapPin, 
  FileText, CheckCircle2, ArrowRight, X, 
  School, Heart, Mail, Phone, Check, AlertCircle, ArrowLeft, Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User, AvailabilitySlot } from '../types';
import AuthCarousel from './AuthCarousel';

interface ProfileSetupProps {
  user: User;
  onComplete: (updatedData: Partial<User>) => void;
  onSkip: () => void;
}

export default function ProfileSetup({ user, onComplete, onSkip }: ProfileSetupProps) {
  // Step progression state
  // 1: Organization & Contact
  // 2: Drop-off Location & Instructions
  // 3: Team Collaboration
  // 4: Availability Schedule
  const [unlockedStep, setUnlockedStep] = useState<number>(1);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [stepError, setStepError] = useState<string>('');

  // Form states initialized with existing user properties
  const [name, setName] = useState(user.name || '');
  const [contactName, setContactName] = useState(user.contactName || '');
  const [contactRole, setContactRole] = useState(user.contactRole || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || 'Midland, MI');
  const [about, setAbout] = useState(user.about || '');
  
  // Drop-off specifications
  const [dropOffLocation, setDropOffLocation] = useState(
    user.dropOffLocation || (user.type === 'school' ? 'Main Entrance, Reception Desk Room 101' : 'Community Donation Center Entrance')
  );
  const [dropOffDetails, setDropOffDetails] = useState(
    user.dropOffDetails || 'Ring buzzer at Door #2. Staff or volunteer coordinator will greet at reception and assist unloading.'
  );
  const [needDropOffAssistance, setNeedDropOffAssistance] = useState(user.needDropOffAssistance || false);
  
  // Team Collaboration Emails
  const [teamEmails, setTeamEmails] = useState<string[]>(
    user.teamEmails && user.teamEmails.length > 0 
      ? user.teamEmails 
      : ['admin@organization.org', 'coordinator@organization.org']
  );
  const [newTeamEmail, setNewTeamEmail] = useState('');

  // Drop-off availability schedule
  const [allowAvailabilityView, setAllowAvailabilityView] = useState(
    user.allowAvailabilityView !== undefined ? user.allowAvailabilityView : true
  );
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>(
    user.availability && user.availability.length > 0
      ? user.availability
      : [
          { day: 'MON', slots: ['8:00 AM', '9:00 AM', '1:00 PM', '2:00 PM'] },
          { day: 'TUES', slots: ['9:00 AM', '10:00 AM'] },
          { day: 'WED', slots: ['8:00 AM', '9:00 AM', '1:00 PM', '2:00 PM'] },
          { day: 'THURS', slots: ['9:00 AM', '10:00 AM'] },
          { day: 'FRI', slots: ['2:00 PM', '3:00 PM'] },
        ]
  );

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  const allPossibleSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleAddTeamEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTeamEmail.trim().toLowerCase();
    if (trimmed && !teamEmails.includes(trimmed)) {
      setTeamEmails(prev => [...prev, trimmed]);
      setNewTeamEmail('');
    }
  };

  const handleRemoveTeamEmail = (emailToRemove: string) => {
    setTeamEmails(prev => prev.filter(em => em !== emailToRemove));
  };

  const toggleSlot = (dayIndex: number, slot: string) => {
    setAvailabilitySlots(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        const exists = day.slots.includes(slot);
        return {
          ...day,
          slots: exists ? day.slots.filter(s => s !== slot) : [...day.slots, slot]
        };
      }
      return day;
    }));
  };

  // Step transitions
  const completeStep1 = () => {
    if (!name.trim()) {
      setStepError('Please provide your organization name to continue.');
      return;
    }
    if (!location.trim()) {
      setStepError('Please specify your city or address location.');
      return;
    }
    setStepError('');
    setUnlockedStep(prev => Math.max(prev, 2));
    setActiveStep(2);
  };

  const completeStep2 = () => {
    if (!dropOffLocation.trim()) {
      setStepError('Please specify where drop-offs should occur in the facility.');
      return;
    }
    setStepError('');
    setUnlockedStep(prev => Math.max(prev, 3));
    setActiveStep(3);
  };

  const completeStep3 = () => {
    setStepError('');
    setUnlockedStep(prev => Math.max(prev, 4));
    setActiveStep(4);
  };

  const handleSave = () => {
    const updatedData: Partial<User> = {
      name: name.trim() || user.name,
      contactName: contactName.trim() || user.contactName,
      contactRole: contactRole.trim() || user.contactRole,
      phone: phone.trim() || user.phone,
      location: location.trim() || user.location,
      about: about.trim() || (user.type === 'school' 
        ? 'Dedicated to providing equitable access and essential supplies for every student in our district.'
        : 'Our mission is to share hope and provide vital resources to uplift youth and local families.'),
      dropOffLocation: dropOffLocation.trim(),
      dropOffDetails: dropOffDetails.trim(),
      teamEmails,
      needDropOffAssistance,
      allowAvailabilityView,
      availability: availabilitySlots,
    };
    onComplete(updatedData);
  };

  const stepsList = [
    { num: 1, label: 'Organization' },
    { num: 2, label: 'Delivery Details' },
    { num: 3, label: 'Team Emails' },
    { num: 4, label: 'Availability' },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white flex justify-center">
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row h-full">
        {/* Left Side - Image Carousel identical to Sign In */}
        <AuthCarousel />

        {/* Right Side - Onboarding Frame */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-start items-center py-8 lg:py-12">
          <div 
            onScroll={handleScroll}
            className={cn(
              "w-full max-w-[660px] lg:h-full lg:overflow-y-auto lg:pl-[40px] lg:pr-[32px] p-6 lg:p-0 custom-scrollbar scrollbar-auto-hide space-y-6",
              isScrolling && "is-scrolling"
            )}
          >
            {/* Header: Brand Logo strictly sans-serif & Onboarding Tag */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <a 
                href="https://www.realizetoact.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex flex-col items-start gap-0.5 hover:opacity-80 transition-opacity group"
              >
                <span className="font-sans font-bold text-brand-primary tracking-tight text-xl">Realize to Act</span>
                <span className="text-[11px] text-slate-400 font-sans tracking-wide uppercase font-semibold">Bridging Resources & Education</span>
              </a>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-[4px]">
                  Step {activeStep} of 4
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {user.type === 'school' ? 'School District' : 'Community Partner'}
                </span>
              </div>
            </div>

            {/* Header Title & Intro */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-1.5">
                Set Up Your Organization Profile
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Welcome, <strong className="text-slate-700">{user.name || 'Partner'}</strong>! Complete each step below to establish your profile. Each section unlocks as the previous step is completed.
              </p>
            </div>

            {/* Step Progress Tally / Bar */}
            <div className="flex p-1 bg-slate-100 rounded-[5px] w-full">
              {stepsList.map(step => {
                const isUnlocked = step.num <= unlockedStep;
                const isCurrent = step.num === activeStep;
                const isCompleted = step.num < unlockedStep;

                return (
                  <button
                    key={step.num}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) {
                        setActiveStep(step.num);
                        setStepError('');
                      }
                    }}
                    className={cn(
                      "flex-1 py-2 px-1 rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      isCurrent && "bg-white text-brand-primary shadow-xs",
                      !isCurrent && isCompleted && "text-slate-700 hover:text-brand-primary",
                      !isCurrent && !isCompleted && isUnlocked && "text-slate-500 hover:text-slate-800",
                      !isUnlocked && "text-slate-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    {isCompleted ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : isUnlocked ? (
                      <span className="w-4 h-4 rounded-full bg-brand-primary/15 text-brand-primary text-[10px] flex items-center justify-center font-bold">
                        {step.num}
                      </span>
                    ) : (
                      <Lock size={12} className="text-slate-400" />
                    )}
                    <span className="truncate">{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Validation Error if any */}
            {stepError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[5px] text-red-600 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span className="font-semibold">{stepError}</span>
              </div>
            )}

            {/* Active Step Content */}
            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[5px] border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    {user.type === 'school' ? (
                      <School className="text-brand-primary" size={18} />
                    ) : (
                      <Heart className="text-brand-primary" size={18} />
                    )}
                    <h2 className="text-base font-serif font-bold text-brand-dark">1. Organization & Contact Details</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {user.type === 'school' ? 'School / District Name*' : 'Organization Name*'}
                      </label>
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="Midland Public Schools"
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-primary" />
                        City & State / Address*
                      </label>
                      <input 
                        type="text"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="Midland, MI"
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Primary Contact Name
                      </label>
                      <input 
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Contact Role / Title
                      </label>
                      <input 
                        type="text"
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        placeholder="Resource Coordinator"
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Phone size={13} className="text-brand-primary" />
                        Phone Number
                      </label>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 342-8921"
                        className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <FileText size={13} className="text-brand-primary" />
                        Mission Statement / About Organization
                      </label>
                      <textarea 
                        rows={2}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder={user.type === 'school' 
                          ? "Describe your school community, demographics, and primary support programs..."
                          : "State your organization's mission and how you partner to serve students..."}
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={completeStep1}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-none"
                    >
                      <span>Complete & Continue to Delivery Details</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[5px] border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <Truck className="text-brand-primary" size={18} />
                    <h2 className="text-base font-serif font-bold text-brand-dark">2. Drop-off Location & Delivery Instructions</h2>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Building2 size={13} className="text-brand-primary" />
                        Drop-off Location Specification in Building*
                      </label>
                      <input 
                        type="text" 
                        value={dropOffLocation}
                        onChange={(e) => {
                          setDropOffLocation(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="e.g. Main Entrance Reception Desk, Room 101, Gate 4" 
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm" 
                        required
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Where should delivery drivers, volunteers, or partners enter and drop off supplies?
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Truck size={13} className="text-brand-primary" />
                        Drop-off Instructions & Delivery Protocol
                      </label>
                      <textarea 
                        rows={2}
                        value={dropOffDetails}
                        onChange={(e) => setDropOffDetails(e.target.value)}
                        placeholder="e.g. Ring buzzer at Door #2. Staff or facilities lead will meet at reception or assist unloading." 
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm leading-relaxed" 
                      />
                    </div>

                    <div className="p-3.5 rounded-[5px] border border-slate-200 bg-slate-50/70">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={needDropOffAssistance}
                          onChange={(e) => setNeedDropOffAssistance(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            I need drop-off assistance from the Realize to Act team
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                            Check this if your site has limited unloading staff or transportation and would like volunteer delivery coordination.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-[5px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Organization</span>
                    </button>
                    <button
                      type="button"
                      onClick={completeStep2}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-none"
                    >
                      <span>Complete & Continue to Team Emails</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[5px] border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <Users className="text-brand-primary" size={18} />
                    <h2 className="text-base font-serif font-bold text-brand-dark">3. Team Member Collaboration Emails</h2>
                  </div>

                  <p className="text-xs text-slate-500">
                    Colleagues added here receive notifications for resource matches, connection requests, and drop-off updates.
                  </p>

                  <form onSubmit={handleAddTeamEmail} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input 
                        type="email"
                        value={newTeamEmail}
                        onChange={(e) => setNewTeamEmail(e.target.value)}
                        placeholder="colleague@organization.org"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-[5px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[5px] transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </form>

                  {teamEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {teamEmails.map(em => (
                        <span 
                          key={em}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
                        >
                          <Mail size={12} className="text-brand-primary" />
                          <span>{em}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTeamEmail(em)}
                            className="text-slate-400 hover:text-slate-600 ml-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-[5px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={completeStep3}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-none"
                    >
                      <span>Continue to Availability Schedule</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[5px] border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="text-brand-primary" size={18} />
                      <h2 className="text-base font-serif font-bold text-brand-dark">4. Drop-off Availability Times</h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Click slots to toggle</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Select standard days and hours when staff or volunteers are on-site to receive packages and unload donations.
                  </p>

                  <div className="border border-slate-200 rounded-[5px] overflow-hidden bg-white">
                    <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-200 text-center py-2 text-[11px] font-bold text-slate-600">
                      {availabilitySlots.map(a => (
                        <span key={a.day}>{a.day}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 p-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {availabilitySlots.map((daySlot, dIdx) => (
                        <div key={daySlot.day} className="space-y-1.5">
                          {allPossibleSlots.map(slot => {
                            const isSelected = daySlot.slots.includes(slot);
                            return (
                              <button
                                type="button"
                                key={slot}
                                onClick={() => toggleSlot(dIdx, slot)}
                                className={cn(
                                  "w-full py-1.5 px-1 rounded-[4px] text-[10px] font-bold transition-all text-center cursor-pointer",
                                  isSelected 
                                    ? "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-none font-bold" 
                                    : "border border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 font-medium"
                                )}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <input 
                      type="checkbox"
                      id="allow-availability-public"
                      checked={allowAvailabilityView}
                      onChange={(e) => setAllowAvailabilityView(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                    />
                    <label htmlFor="allow-availability-public" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Allow connected community partners to view schedule when proposing handoff times
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-[5px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Team</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-none cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>Save Profile & Enter Platform</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Global Controls Bar */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-4 pb-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
              <button
                type="button"
                onClick={onSkip}
                className="w-full sm:w-auto px-5 py-3 rounded-[5px] border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all text-center cursor-pointer shadow-none"
              >
                Skip for Now & Go to Dashboard
              </button>

              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 1) completeStep1();
                    else if (activeStep === 2) completeStep2();
                    else if (activeStep === 3) completeStep3();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-none cursor-pointer"
                >
                  <span>Continue to Step {activeStep + 1}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full sm:w-auto px-6 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-none cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>Save Profile & Enter Platform</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
