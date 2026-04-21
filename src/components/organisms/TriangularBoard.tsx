import React from 'react';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { RequestCard } from '../molecules/RequestCard';
import { OfferCard } from '../molecules/OfferCard';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '../atoms/Button';
import { ArrowRight } from 'lucide-react';

interface TriangularBoardProps {
  requests: HelpRequest[];
  offers: HelpOffer[];
  loading?: boolean;
}

export const TriangularBoard: React.FC<TriangularBoardProps> = ({
  requests,
  offers,
  loading = false,
}) => {
  const t = useTranslations();

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 rounded-xl bg-brand-surface animate-pulse" />
      ))}
    </div>
  );

  const requestScales = ['md:scale-110', 'md:scale-95', 'md:scale-80'];
  const requestOffsets = ['md:translate-x-0', 'md:translate-x-4', 'md:translate-x-8'];

  const offerScales = ['md:scale-80', 'md:scale-95', 'md:scale-110'];
  const offerOffsets = ['md:translate-x-8', 'md:translate-x-4', 'md:translate-x-0'];

  const zIndexes = ['z-30', 'z-20', 'z-10'];
  const offerZIndexes = ['z-10', 'z-20', 'z-30'];

  return (
    <div className="space-y-24 md:space-y-32 py-16">
      {/* Requests Section - Top Triangle (Decreasing) */}
      <section className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-brand-text-main">
            {t('browse_requests')}
          </h2>
          <Link href="/requests">
            <Button variant="ghost" className="gap-2 text-lg">
              {t('learn_more')}
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>

        {loading ? (
          renderSkeleton()
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 items-center">
            {requests.slice(0, 3).map((request, index) => (
              <div
                key={request.id}
                className={`${requestScales[index]} ${requestOffsets[index]} ${zIndexes[index]} transition-all duration-500 hover:scale-[1.15] hover:translate-x-0 hover:z-40`}
              >
                <RequestCard request={request} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-brand-text-secondary py-10 bg-brand-surface rounded-2xl border border-dashed border-brand-border">
            {t('no_requests')}
          </p>
        )}
      </section>

      {/* Offers Section - Bottom Triangle (Increasing) */}
      <section className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-brand-text-main">
            {t('browse_offers')}
          </h2>
          <Link href="/offers">
            <Button variant="ghost" className="gap-2 text-lg">
              {t('learn_more')}
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>

        {loading ? (
          renderSkeleton()
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 items-center">
            {offers.slice(0, 3).map((offer, index) => (
              <div
                key={offer.id}
                className={`${offerScales[index]} ${offerOffsets[index]} ${offerZIndexes[index]} transition-all duration-500 hover:scale-[1.15] hover:translate-x-0 hover:z-40`}
              >
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-brand-text-secondary py-10 bg-brand-surface rounded-2xl border border-dashed border-brand-border">
            {t('no_offers')}
          </p>
        )}
      </section>
    </div>
  );
};
