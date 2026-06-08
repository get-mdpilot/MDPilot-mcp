'use client';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface WizardOptionCardProps {
  icon:            React.ReactNode;
  label:           string;
  desc:            string;
  selected:        boolean;
  onClick:         () => void;
  accentColor?:    string;
  indicatorType?:  'single' | 'multi';
  badge?:          string;
  badgeVariant?:   'blue' | 'teal' | 'mono';
  disabled?:       boolean;
}

const BADGE_STYLES: Record<string, string> = {
  blue:  'bg-[#4FACFF]/15 text-[#4FACFF]',
  teal:  'bg-[#2DD4BF]/15 text-[#2DD4BF]',
  mono:  'bg-white/[0.07] text-white/35',
};

export function WizardOptionCard({
  icon, label, desc, selected, onClick,
  accentColor = '#4FACFF',
  indicatorType = 'single',
  badge,
  badgeVariant = 'mono',
  disabled = false,
}: WizardOptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setRot({
      x: -((e.clientY - r.top - r.height / 2) / r.height) * 7,
      y:  ((e.clientX - r.left - r.width / 2)  / r.width)  * 7,
    });
  };

  const selectedRgb = accentColor === '#2DD4BF' ? '45,212,191'
    : accentColor === '#A855F7' ? '168,85,247'
    : '79,172,255';

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className={`relative rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${accentColor}]/50 ${
        disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'
      }`}
      style={{
        background: '#0b1020',
        transformStyle: 'preserve-3d',
        boxShadow: selected
          ? `0 -6px 50px 4px rgba(${selectedRgb},0.22), 0 0 8px 0 rgba(0,0,0,0.5)`
          : hovered
            ? '0 -4px 30px 3px rgba(78,99,255,0.14), 0 0 6px 0 rgba(0,0,0,0.4)'
            : '0 -3px 20px 2px rgba(78,99,255,0.08), 0 0 4px 0 rgba(0,0,0,0.35)',
      }}
      animate={{
        rotateX: hovered && !disabled ? rot.x : 0,
        rotateY: hovered && !disabled ? rot.y : 0,
        y:       hovered && !disabled ? -3 : 0,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onMouseEnter={() => { if (!disabled) setHovered(true); }}
      onMouseLeave={() => { setHovered(false); setRot({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
    >
      {/* Glass sheen */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.03) 100%)',
          opacity: hovered ? 0.9 : 0.6,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Bottom ambient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-3/5 pointer-events-none z-10"
        style={{
          background: selected
            ? `radial-gradient(ellipse at bottom center, rgba(${selectedRgb},0.45) -15%, transparent 65%)`
            : 'radial-gradient(ellipse at bottom right, rgba(168,85,247,0.4) -10%, transparent 65%), radial-gradient(ellipse at bottom left, rgba(56,189,248,0.35) -10%, transparent 65%)',
          filter: 'blur(18px)',
          opacity: hovered ? 1 : 0.65,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none z-20"
        style={{
          background: selected
            ? `linear-gradient(90deg, transparent 0%, rgba(${selectedRgb},0.85) 50%, transparent 100%)`
            : 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.03) 100%)',
          boxShadow: selected
            ? `0 0 12px 3px rgba(${selectedRgb},0.65), 0 0 22px 5px rgba(${selectedRgb},0.35)`
            : hovered
              ? '0 0 10px 2px rgba(168,85,247,0.65), 0 0 18px 4px rgba(56,189,248,0.4)'
              : '0 0 7px 2px rgba(168,85,247,0.45)',
          transition: 'box-shadow 0.3s',
        }}
      />

      {/* Content */}
      <div className="relative z-30 flex items-start gap-3.5 p-4">
        {/* Indicator (radio/check on left) — single select only */}
        {indicatorType === 'single' && (
          <div className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
            selected
              ? 'border-[--accent] bg-[--accent]'
              : 'border-white/20'
          }`}
            style={{ '--accent': accentColor } as React.CSSProperties}
          >
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        )}

        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
          style={{
            background: selected ? `rgba(${selectedRgb},0.14)` : 'rgba(255,255,255,0.05)',
            color: selected ? accentColor : 'rgba(255,255,255,0.38)',
            border: `1px solid ${selected ? `rgba(${selectedRgb},0.35)` : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`text-[13px] font-semibold transition-colors ${selected ? 'text-white' : 'text-white/65'}`}>
              {label}
            </span>
            {badge && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${BADGE_STYLES[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/32 leading-snug">{desc}</p>
        </div>

        {/* Multi-select checkbox */}
        {indicatorType === 'multi' && (
          <div
            className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
            style={{
              background: selected ? accentColor : 'transparent',
              border: selected ? 'none' : '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {selected && <Check size={11} strokeWidth={3} color="white" />}
          </div>
        )}
      </div>
    </motion.div>
  );
}
