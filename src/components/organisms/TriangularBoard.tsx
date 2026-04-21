import React from 'react';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { RequestCard } from '../molecules/RequestCard';
import { OfferCard } from '../molecules/OfferCard';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '../atoms/Button';
import { HandHelping, Heart, ArrowRight } from 'lucide-react';

interface TriangularBoardProps {
  requests: HelpRequest[];
  offers: HelpOffer[];
}

export const TriangularBoard: React.FC<TriangularBoardProps> = ({ requests, offers }) => {
  const t = useTranslations();

  return (
    <div className="relative w-full h-[850px] overflow-hidden bg-brand-background hidden md:block">
      {/* Diagonal Line - Less steep */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line
          x1="0"
          y1="65"
          x2="100"
          y2="35"
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-brand-border"
        />
      </svg>

      {/* Browse Requests (Top Section) */}
      <div className="absolute top-0 left-0 w-full h-[55%] pt-4 px-12">
        <div className="flex items-center gap-3 mb-8">
          <HandHelping className="text-brand-primary w-10 h-10" />
          <h2 className="text-4xl font-bold tracking-tight text-brand-text-main">
            {t('browse_requests')}
          </h2>
        </div>

        <div className="flex items-start gap-6 max-w-[1300px] mx-auto">
          {requests.length > 0 ? (
            requests.slice(0, 2).map((request, index) => {
              const scale = 1 - index * 0.2;
              const opacity = 1 - index * 0.15;
              return (
                <div
                  key={request.id}
                  className="w-80 flex-shrink-0 transition-all duration-300 hover:z-20 relative"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'left top',
                    opacity: opacity,
                  }}
                >
                  <RequestCard request={request} />
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-64 w-80 bg-brand-surface rounded-2xl border border-dashed border-brand-border text-brand-text-secondary font-medium">
              {t('no_requests')}
            </div>
          )}

          <div className="flex flex-col justify-start pt-20 ml-4">
            <Link href="/requests">
              <Button variant="ghost" className="group gap-2 text-brand-primary font-bold text-lg hover:bg-brand-primary/10">
                {t('learn_more')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Browse Offers (Bottom Section) */}
      <div className="absolute bottom-0 left-0 w-full h-[55%] pb-4 px-12 flex flex-col items-end justify-end">
        <div className="flex items-center gap-3 mb-8 mr-12">
          <h2 className="text-4xl font-bold tracking-tight text-brand-text-main">
            {t('browse_offers')}
          </h2>
          <Heart className="text-brand-secondary w-10 h-10 fill-brand-secondary" />
        </div>

        <div className="flex items-end gap-6 max-w-[1300px] mx-auto justify-end w-full">
          <div className="flex flex-col justify-end pb-20 mr-4">
            <Link href="/offers">
              <Button variant="ghost" className="group gap-2 text-brand-secondary font-bold text-lg hover:bg-brand-secondary/10">
                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                {t('learn_more')}
              </Button>
            </Link>
          </div>

          {offers.length > 0 ? (
            offers
              .slice(0, 2)
              .reverse()
              .map((offer, index) => {
                const scale = 0.8 + index * 0.2;
                const opacity = 0.85 + index * 0.15;
                return (
                  <div
                    key={offer.id}
                    className="w-80 flex-shrink-0 transition-all duration-300 hover:z-20 relative"
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'right bottom',
                      opacity: opacity,
                    }}
                  >
                    <OfferCard offer={offer} />
                  </div>
                );
              })
          ) : (
            <div className="flex items-center justify-center h-64 w-80 bg-brand-surface rounded-2xl border border-dashed border-brand-border text-brand-text-secondary font-medium">
              {t('no_offers')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
