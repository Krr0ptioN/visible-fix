import type { SelectHTMLAttributes } from 'react';
import { cn } from './utils';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'min-h-11 w-full border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
