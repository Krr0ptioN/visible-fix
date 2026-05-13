import Link from 'next/link';
import { cn } from '@/components/ui';
import type { ActivePage, Translate } from './types';

const NAV_ITEMS: Array<{ key: ActivePage; href: string; translationKey: string }> = [
  { key: 'home', href: '/', translationKey: 'Overview' },
  { key: 'issues', href: '/issues', translationKey: 'Discovery' },
  { key: 'report', href: '/report', translationKey: 'Report' },
];

export function NavigationLinks({ activePage, t }: { activePage: ActivePage; t: Translate }) {
  return (
    <nav className="flex flex-wrap items-center gap-0 border border-border bg-card shadow-razor">
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === activePage;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'inline-flex min-h-10 items-center border-r border-border px-4 text-sm font-semibold transition last:border-r-0',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {t(item.translationKey)}
          </Link>
        );
      })}
    </nav>
  );
}
