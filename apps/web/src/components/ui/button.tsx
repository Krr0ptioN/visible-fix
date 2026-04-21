import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'danger';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  default:
    'border-primary bg-primary text-primary-foreground hover:bg-[#1a1a1d] hover:border-[#1a1a1d]',
  outline:
    'border-border bg-card text-foreground hover:bg-secondary hover:border-foreground',
  ghost:
    'border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
  danger:
    'border-[#d92d20] bg-[#d92d20] text-white hover:border-[#b42318] hover:bg-[#b42318]',
};

export function Button({
  className,
  variant = 'default',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm font-semibold tracking-[-0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    />
  );
}
