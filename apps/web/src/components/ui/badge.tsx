import { cn } from './utils';

type BadgeVariant = 'default' | 'subtle' | 'status';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'border-primary bg-primary text-primary-foreground',
  subtle: 'border-border bg-secondary text-muted-foreground',
  status: 'border-transparent text-white',
};

export function Badge({
  children,
  className,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
        VARIANT_STYLES[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
