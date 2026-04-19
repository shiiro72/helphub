import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { HelpOffer } from '@/lib/types';
import { OfferCard } from '../molecules/OfferCard';
import { OfferListItem } from '../molecules/OfferListItem';
import { PostHelpModal } from './PostHelpModal';
import { BaseBoard } from './BaseBoard';
import { useAuth } from '@/lib/hooks/useAuth';
import { ConfirmationModal } from '../molecules/ConfirmationModal';

export const OfferBoard: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostClick = () => {
    if (user) {
      setIsPostModalOpen(true);
    } else {
      setIsLoginPromptOpen(true);
    }
  };

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
        onPostClick={handlePostClick}
        renderGridItem={(offer) => <OfferCard offer={offer} />}
        renderListItem={(offer) => <OfferListItem offer={offer} />}
        filterFn={filterFn}
        refreshTrigger={refreshTrigger}
      />

      <ConfirmationModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onConfirm={() => router.push('/login')}
        title={t('login_required')}
        message={t('login_to_post')}
        confirmText={t('login_now')}
        cancelText={t('cancel')}
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
