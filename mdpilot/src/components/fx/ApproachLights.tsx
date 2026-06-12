/* Approach lighting system — a row of sequenced strobes that "run" toward
   whatever sits below them (the final CTA). Server component, CSS-driven. */
export default function ApproachLights({ count = 13 }: { count?: number }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="approach-light" style={{ animationDelay: `${i * 0.11}s` }} />
      ))}
    </div>
  );
}
