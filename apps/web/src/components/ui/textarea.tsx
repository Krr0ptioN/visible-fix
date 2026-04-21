import type { TextareaHTMLAttributes } from 'react';
import { cn } from './utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full border border-input bg-card px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-[#8c8c92] focus:border-foreground',
        className
      )}
      {...props}
    />
  );
}
