import { cn } from './utils';

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground', className)}>{children}</p>;
}
