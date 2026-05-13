import Link from "next/link";
import { cn } from '@/components/ui';

export function Footer({ className, t }: { className: string | undefined; t: (key: string, params?: { [x: string]: string | number; }) => string }) {
  return <footer className={cn('mt-10 border-t border-border bg-primary text-primary-foreground sm:mt-16', className)}>
    <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:px-8">
      <div className="max-w-xl">
        <p className="vf-display text-xl font-bold sm:text-2xl">{t('A sharper public interface for civic trust.')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-white/72">
        <Link href="/issues" className="hover:text-white">
          {t('Explore issues')}
        </Link>
        <Link href="/report" className="hover:text-white">
          {t('Submit report')}
        </Link>
      </div>
    </div>
  </footer>;
}
