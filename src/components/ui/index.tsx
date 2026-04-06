// src/components/ui/index.tsx
'use client';

import { type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';

// ─── Button ───
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Btn({ variant = 'primary', size = 'md', className = '', children, ...props }: BtnProps) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50';
  const sizes = { sm: 'px-4 py-2 text-[13px]', md: 'px-6 py-3 text-sm' };
  const variants = {
    primary: 'bg-green-deep text-white hover:bg-green-light hover:-translate-y-0.5 hover:shadow-lg',
    outline: 'border-[1.5px] border-green-deep text-green-deep hover:bg-green-pale',
    ghost: 'border border-border text-gray-500 hover:bg-gray-50',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// ─── Badge ───
export function Badge({ children, color = 'green' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-pale text-green-deep',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${colors[color] || colors.green}`}>
      {children}
    </span>
  );
}

// ─── Input ───
interface InputFieldProps {
  label?: string;
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

export function InputField({ label, multiline, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  const id = label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined;
  const cls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40 transition-colors bg-white';
  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="block mb-1.5 text-[13px] font-semibold text-gray-700">{label}</label>}
      {multiline ? (
        <textarea id={id} className={`${cls} min-h-[120px] resize-y`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={label || placeholder} />
      ) : (
        <input id={id} className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={label || placeholder} />
      )}
    </div>
  );
}

// ─── Select ───
interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  const id = label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined;
  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="block mb-1.5 text-[13px] font-semibold text-gray-700">{label}</label>}
      <select id={id} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-green-deep/40" value={value} onChange={e => onChange(e.target.value)} aria-label={label}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Icon (Lucide-style SVG) ───
const PATHS: Record<string, React.ReactNode> = {
  menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  arrow: <><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>,
  back: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></>,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  file: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash: <><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
};

export function Icon({ name, size = 18, className = '', label }: { name: string; size?: number; className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={!label} aria-label={label} role={label ? 'img' : 'presentation'}>
      {PATHS[name] || null}
    </svg>
  );
}
