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
    <div className="relative w-full h-[900px] overflow-hidden bg-brand-background hidden md:block border-y border-brand-border/30 my-10">
      {/* Diagonal Line */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="0"
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-brand-border"
        />
      </svg>

      {/* Browse Requests (Top-Left Triangle) */}
      <div className="absolute top-0 left-0 w-full h-1/2 p-12">
        <div className="flex items-center gap-3 mb-12">
          <HandHelping className="text-brand-primary w-10 h-10" />
          <h2 className="text-4xl font-bold tracking-tight text-brand-text-main">
            {t('browse_requests')}
          </h2>
        </div>

        <div className="flex items-start gap-4 h-full max-w-[1200px] mx-auto">
          {requests.slice(0, 3).map((request, index) => {
            // index 0: 1.0, index 1: 0.8, index 2: 0.6
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
          })}

          <div className="flex flex-col justify-start pt-12">
            <Link href="/requests">
              <Button variant="ghost" className="group gap-2 text-brand-primary font-bold text-lg hover:bg-brand-primary/10">
                {t('learn_more')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Browse Offers (Bottom-Right Triangle) */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 p-12 flex flex-col justify-end items-end">
        <div className="flex items-end gap-4 h-full max-w-[1200px] mx-auto justify-end">
          <div className="flex flex-col justify-end pb-12">
            <Link href="/offers">
              <Button variant="ghost" className="group gap-2 text-brand-secondary font-bold text-lg hover:bg-brand-secondary/10">
                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                {t('learn_more')}
              </Button>
            </Link>
          </div>

          {offers.slice(0, 3).reverse().map((offer, index) => {
            // index 0: 0.6, index 1: 0.8, index 2: 1.0
            const scale = 0.6 + index * 0.2;
            const opacity = 0.7 + index * 0.15;
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
          })}
        </div>

        <div className="flex items-center gap-3 mt-12">
          <h2 className="text-4xl font-bold tracking-tight text-brand-text-main">
            {t('browse_offers')}
          </h2>
          <Heart className="text-brand-secondary w-10 h-10 fill-brand-secondary" />
        </div>
      </div>
    </div>
  );
};
