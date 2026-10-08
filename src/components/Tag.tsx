import React from 'react';
import { 
  Backpack, Package, Sparkles, Utensils, 
  Shirt, Laptop, Book, Home, Palette, Check, Clock, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

export type TagVariant = 
  | 'category' 
  | 'status-pending' 
  | 'status-approved' 
  | 'status-denied' 
  | 'status-cancelled'
  | 'status-active'
  | 'neutral' 
  | 'subtle';

interface TagProps {
  key?: React.Key;
  label: string;
  variant?: TagVariant;
  icon?: React.ReactNode;
  category?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const getCategoryIcon = (categoryOrItem: string, size: number = 13) => {
  const lower = categoryOrItem.toLowerCase();
  if (lower.includes('backpack')) return <Backpack size={size} />;
  if (lower.includes('school') || lower.includes('suppl') || lower.includes('kit') || lower.includes('pencil') || lower.includes('notebook')) return <Package size={size} />;
  if (lower.includes('hygiene') || lower.includes('care') || lower.includes('deodorant') || lower.includes('soap') || lower.includes('dental')) return <Sparkles size={size} />;
  if (lower.includes('food') || lower.includes('meal') || lower.includes('snack') || lower.includes('pantry') || lower.includes('nutrition')) return <Utensils size={size} />;
  if (lower.includes('cloth') || lower.includes('shirt') || lower.includes('coat') || lower.includes('hoodie') || lower.includes('shoe')) return <Shirt size={size} />;
  if (lower.includes('tech') || lower.includes('laptop') || lower.includes('computer') || lower.includes('chromebook') || lower.includes('tablet')) return <Laptop size={size} />;
  if (lower.includes('book') || lower.includes('textbook') || lower.includes('literacy') || lower.includes('reader')) return <Book size={size} />;
  if (lower.includes('clean') || lower.includes('wipe') || lower.includes('sanit') || lower.includes('disinfect')) return <Home size={size} />;
  if (lower.includes('stem') || lower.includes('art') || lower.includes('enrich') || lower.includes('craft') || lower.includes('paint')) return <Palette size={size} />;
  return <Package size={size} />;
};

export default function Tag({ label, variant = 'category', icon, category, size = 'sm', className }: TagProps) {
  let variantStyles = '';
  let defaultIcon = icon;

  switch (variant) {
    case 'category':
      variantStyles = 'bg-brand-secondary/40 text-brand-dark border-brand-primary/20';
      if (!defaultIcon) defaultIcon = getCategoryIcon(category || label, size === 'sm' ? 12 : 13);
      break;
    case 'status-pending':
      variantStyles = 'bg-amber-50 text-amber-800 border-amber-200/70';
      if (!defaultIcon) defaultIcon = <Clock size={size === 'sm' ? 12 : 13} className="text-amber-600" />;
      break;
    case 'status-approved':
      variantStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
      if (!defaultIcon) defaultIcon = <Check size={size === 'sm' ? 12 : 13} className="text-emerald-600" />;
      break;
    case 'status-denied':
    case 'status-cancelled':
      variantStyles = 'bg-red-50 text-red-800 border-red-200/70';
      if (!defaultIcon) defaultIcon = <AlertTriangle size={size === 'sm' ? 12 : 13} className="text-red-600" />;
      break;
    case 'status-active':
      variantStyles = 'bg-sky-50 text-sky-800 border-sky-200/70';
      if (!defaultIcon) defaultIcon = <Sparkles size={size === 'sm' ? 12 : 13} className="text-sky-600" />;
      break;
    case 'neutral':
      variantStyles = 'bg-slate-100 text-slate-700 border-slate-200/70';
      break;
    case 'subtle':
      variantStyles = 'bg-white text-slate-600 border-slate-200/70';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[4px] border font-semibold tracking-normal transition-all shrink-0',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px] leading-tight' : 'px-3 py-1 text-xs leading-normal',
        variantStyles,
        className
      )}
    >
      {defaultIcon && <span className="shrink-0">{defaultIcon}</span>}
      <span className="capitalize">{label}</span>
    </span>
  );
}
