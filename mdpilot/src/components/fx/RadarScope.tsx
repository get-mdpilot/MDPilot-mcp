/* Radar scope — pure CSS instrument: rotating sweep, range rings, blips.
   Server component; all motion lives in globals.css. */
export default function RadarScope({ size = 168 }: { size?: number }) {
  return (
    <div className="radar-scope shrink-0" style={{ width: size, height: size }} aria-hidden>
      {/* Range rings */}
      <div className="radar-ring" style={{ inset: '16%' }} />
      <div className="radar-ring" style={{ inset: '33%' }} />
      {/* Crosshair */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--md-border)]" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--md-border)]" />
      {/* Sweep */}
      <div className="radar-sweep" />
      {/* Contacts — two on course, one drifting */}
      <span className="radar-blip" style={{ top: '30%', left: '62%', animationDelay: '0.9s' }} />
      <span className="radar-blip" style={{ top: '68%', left: '38%', animationDelay: '2.6s' }} />
      <span className="radar-blip radar-blip--caution" style={{ top: '46%', left: '24%', animationDelay: '4.0s' }} />
      {/* Bezel label */}
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--md-text-tertiary)]">
        drift scan
      </span>
    </div>
  );
}
