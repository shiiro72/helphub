import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { HandHelping, Heart } from 'lucide-react';

export const BoardToggle: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const isRequests = router.pathname === '/requests';
  const isOffers = router.pathname === '/offers';

  return (
    <div className="inline-flex p-1 bg-brand-border/10 rounded-xl border border-brand-border/20 shadow-sm">
      <Link href="/requests" className="flex-1 min-w-45">
        <span
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isRequests
              ? 'bg-brand-surface shadow-sm text-brand-primary ring-1 ring-brand-border/10'
              : 'text-brand-text-secondary hover:text-brand-text-main hover:bg-brand-surface/50'
          }`}
        >
          <HandHelping
            size={18}
            className={isRequests ? 'text-brand-primary' : 'text-brand-text-secondary'}
          />
          {t('browse_requests')}
        </span>
      </Link>
      <Link href="/offers" className="flex-1 min-w-45">
        <span
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isOffers
              ? 'bg-brand-surface shadow-sm text-brand-secondary ring-1 ring-brand-border/10'
              : 'text-brand-text-secondary hover:text-brand-text-main hover:bg-brand-surface/50'
          }`}
        >
          <Heart
            size={18}
            className={
              isOffers
                ? 'text-brand-secondary fill-brand-secondary/10'
                : 'text-brand-text-secondary'
            }
          />
          {t('browse_offers')}
        </span>
      </Link>
    </div>
  );
};
