import React, { useState } from 'react';
import { HelpOffer } from '@/lib/types';
import { OfferCard } from '../molecules/OfferCard';
import { OfferListItem } from '../molecules/OfferListItem';
import { PostHelpModal } from './PostHelpModal';
import { BaseBoard } from './BaseBoard';

export const OfferBoard: React.FC = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const filterFn = (offer: HelpOffer, query: string) =>
    offer.title.toLowerCase().includes(query.toLowerCase()) ||
    offer.content.toLowerCase().includes(query.toLowerCase()) ||
    (offer.offer_location || '').toLowerCase().includes(query.toLowerCase());

  return (
    <>
      <BaseBoard<HelpOffer>
        title="Offers"
        table="help_offers"
        searchPlaceholder="Search offers..."
        postButtonText="Post Offer"
        emptyMessage="No help offers found."
        onPostClick={() => setIsPostModalOpen(true)}
        renderGridItem={(offer) => <OfferCard offer={offer} />}
        renderListItem={(offer) => <OfferListItem offer={offer} />}
        filterFn={filterFn}
        refreshTrigger={refreshTrigger}
      />

      <PostHelpModal
        type="offer"
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </>
  );
};
