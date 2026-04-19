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

  const filterFn = (offer: HelpOffer, filters: { query: string; city: string; country: string; dateRange: string; startDate: string }) => {
    const { query, city, country, dateRange, startDate } = filters;

    // Search filter
    const matchesSearch =
      offer.title.toLowerCase().includes(query.toLowerCase()) ||
      offer.content.toLowerCase().includes(query.toLowerCase());

    // City filter
    const matchesCity = !city || (offer.city || '').toLowerCase().includes(city.toLowerCase());

    // Country filter
    const matchesCountry = !country || (offer.country || '').toLowerCase().includes(country.toLowerCase());

    // Date filter (posted)
    let matchesDate = true;
    if (dateRange !== 'all') {
      const postDate = new Date(offer.date_posted);
      const now = new Date();
      if (dateRange === 'today') {
        matchesDate = postDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = postDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = postDate >= monthAgo;
      }
    }

    // Start date filter (required start)
    let matchesStartDate = true;
    if (startDate && offer.start_datetime) {
      const filterDate = new Date(startDate);
      const offerStartDate = new Date(offer.start_datetime);
      // Compare just dates
      matchesStartDate = offerStartDate >= filterDate;
    }

    return matchesSearch && matchesCity && matchesCountry && matchesDate && matchesStartDate;
  };

  return (
    <>
      <BaseBoard<HelpOffer>
        title="Offers"
        table="help_offers"
        searchPlaceholder="Search offers..."
        postButtonText="Post Offer"
        emptyMessage="No help offers found."
        onPostClick={handlePostClick}
        renderGridItem={(offer, query) => <OfferCard offer={offer} searchQuery={query} />}
        renderListItem={(offer, query) => <OfferListItem offer={offer} searchQuery={query} />}
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
