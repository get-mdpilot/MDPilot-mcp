import React from 'react';
import { cn } from '@/lib/utils';

export function GridCard({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group relative isolate z-0 flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-[var(--md-radius-sm)] border border-[var(--md-border)] bg-[var(--md-surface)] px-5 py-4 transition-colors duration-150 hover:border-[var(--md-border-strong)] hover:bg-[var(--md-surface-2)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
