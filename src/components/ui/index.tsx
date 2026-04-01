'use client';

import React from 'react';
import { COLORS } from '../../types/constants';

const { G, GP } = COLORS;

// ── Icon ──
const iconPaths: Record<string, React.ReactNode> = {
  menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  arrow: <><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>,
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
  back: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const s: React.CSSProperties = { width: size, height: size, strokeWidth: 1.6, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return <svg viewBox="0 0 24 24" style={s} className={className}>{iconPaths[name]}</svg>;
}

// ── Button ──
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export function Btn({ children, variant = 'primary', onClick, style, small, disabled, className }: {
  children: React.ReactNode; variant?: BtnVariant; onClick?: () => void; style?: React.CSSProperties; small?: boolean; disabled?: boolean; className?: string;
}) {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: small ? '8px 16px' : '12px 24px', borderRadius: 8, fontSize: small ? 13 : 14, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', border: 'none', transition: 'all .2s', fontFamily: 'inherit', opacity: disabled ? 0.5 : 1 };
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: G, color: '#fff' },
    outline: { background: 'transparent', color: G, border: `1.5px solid ${G}` },
    ghost: { background: 'transparent', color: '#555', border: '1px solid #e2e2e0' },
    danger: { background: '#fff0f0', color: '#a03030', border: '1px solid #e8b0b0' },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled} className={className}>{children}</button>;
}

// ── Badge ──
export function Badge({ children, color = G, className }: { children: React.ReactNode; color?: string; className?: string }) {
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, background: color + '18', color, textTransform: 'uppercase' }} className={className}>{children}</span>;
}

// ── Input ──
export function InputField({ label, value, onChange, multiline, placeholder, type = 'text', className }: {
  label?: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; type?: string; className?: string;
}) {
  const s: React.CSSProperties = { width: '100%', padding: multiline ? '12px 14px' : '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', resize: multiline ? 'vertical' : 'none', minHeight: multiline ? 120 : 'auto', background: '#fff', outline: 'none', transition: 'border .2s' };
  return (
    <div style={{ marginBottom: 16 }} className={className}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#333' }}>{label}</label>}
      {multiline
        ? <textarea style={s} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={s} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

// ── Select ──
export function SelectField({ label, value, onChange, options, className }: {
  label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }} className={className}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#333' }}>{label}</label>}
      <select style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', background: '#fff' }} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
