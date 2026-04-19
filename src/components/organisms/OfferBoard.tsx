import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { HelpOffer } from '@/lib/types';
import { OfferCard } from '../molecules/OfferCard';
import { OfferListItem } from '../molecules/OfferListItem';
import { PostHelpModal } from './PostHelpModal';
import { BaseBoard } from './BaseBoard';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { ConfirmationModal } from '../molecules/ConfirmationModal';

export const OfferBoard: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingOffer, setEditingOffer] = useState<HelpOffer | null>(null);
  const [deletingOffer, setDeletingOffer] = useState<HelpOffer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePostClick = () => {
    setEditingOffer(null);
    if (user) {
      setIsPostModalOpen(true);
    } else {
      setIsLoginPromptOpen(true);
    }
  };

  const handleEditClick = (offer: HelpOffer) => {
    setEditingOffer(offer);
    setIsPostModalOpen(true);
  };

  const handleDeleteClick = (offer: HelpOffer) => {
    setDeletingOffer(offer);
  };

  const confirmDelete = async () => {
    if (!deletingOffer) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('help_offers')
      .delete()
      .eq('id', deletingOffer.id);

    if (error) {
      console.error('Error deleting offer:', error);
    } else {
      setRefreshTrigger(prev => prev + 1);
      setDeletingOffer(null);
    }
    setIsDeleting(false);
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

    // Exclude expired posts
    let isNotExpired = true;
    if (offer.end_datetime) {
      const endDateTime = new Date(offer.end_datetime);
      const now = new Date();
      isNotExpired = endDateTime > now;
    }

    return matchesSearch && matchesCity && matchesCountry && matchesDate && matchesStartDate && isNotExpired;
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
        renderGridItem={(offer, query) => (
          <OfferCard
            offer={offer}
            searchQuery={query}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
        renderListItem={(offer, query) => (
          <OfferListItem
            offer={offer}
            searchQuery={query}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
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

      <ConfirmationModal
        isOpen={!!deletingOffer}
        onClose={() => setDeletingOffer(null)}
        onConfirm={confirmDelete}
        title="Delete Offer"
        message="Are you sure you want to delete this help offer? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <PostHelpModal
        type="offer"
        isOpen={isPostModalOpen}
        initialData={editingOffer}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingOffer(null);
        }}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </>
  );
};
