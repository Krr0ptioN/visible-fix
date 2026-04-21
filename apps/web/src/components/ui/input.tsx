import type { InputHTMLAttributes } from 'react';
import { cn } from './utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-11 w-full border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-[#8c8c92] focus:border-foreground',
        className
      )}
      {...props}
    />
  );
}
