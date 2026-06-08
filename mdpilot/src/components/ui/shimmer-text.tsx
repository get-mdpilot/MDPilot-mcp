'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  duration?: number;
  delay?: number;
}

export function ShimmerText({
  children,
  className,
  shimmerColor = 'rgba(255,255,255,0.85)',
  duration = 2,
  delay = 1,
}: ShimmerTextProps) {
  return (
    <div className="group overflow-hidden inline-block">
      <motion.div
        className={cn('inline-block', className)}
        style={{
          WebkitTextFillColor: 'transparent',
          background: `currentColor linear-gradient(to right, currentColor 0%, ${shimmerColor} 40%, ${shimmerColor} 60%, currentColor 100%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '50% 200%',
        } as React.CSSProperties}
        initial={{ backgroundPositionX: '250%' }}
        animate={{ backgroundPositionX: ['-100%', '250%'] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'linear',
        }}
      >
        <span>{children}</span>
      </motion.div>
    </div>
  );
}

export default ShimmerText;
