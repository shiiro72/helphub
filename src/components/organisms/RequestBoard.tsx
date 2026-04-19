import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { HelpRequest } from '@/lib/types';
import { RequestCard } from '../molecules/RequestCard';
import { RequestListItem } from '../molecules/RequestListItem';
import { PostHelpModal } from './PostHelpModal';
import { BaseBoard } from './BaseBoard';
import { useAuth } from '@/lib/hooks/useAuth';
import { ConfirmationModal } from '../molecules/ConfirmationModal';

export const RequestBoard: React.FC = () => {
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

  const filterFn = (req: HelpRequest, filters: { query: string; city: string; country: string; dateRange: string; startDate: string }) => {
    const { query, city, country, dateRange, startDate } = filters;

    // Search filter
    const matchesSearch =
      req.title.toLowerCase().includes(query.toLowerCase()) ||
      req.content.toLowerCase().includes(query.toLowerCase());

    // City filter
    const matchesCity = !city || (req.city || '').toLowerCase().includes(city.toLowerCase());

    // Country filter
    const matchesCountry = !country || (req.country || '').toLowerCase().includes(country.toLowerCase());

    // Date filter (posted)
    let matchesDate = true;
    if (dateRange !== 'all') {
      const postDate = new Date(req.date_posted);
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
    if (startDate && req.start_datetime) {
      const filterDate = new Date(startDate);
      const reqStartDate = new Date(req.start_datetime);
      // Compare just dates
      matchesStartDate = reqStartDate >= filterDate;
    }

    return matchesSearch && matchesCity && matchesCountry && matchesDate && matchesStartDate;
  };

  return (
    <>
      <BaseBoard<HelpRequest>
        title="Requests"
        table="help_requests"
        searchPlaceholder="Search requests..."
        postButtonText="Post Request"
        emptyMessage="No help requests found."
        onPostClick={handlePostClick}
        renderGridItem={(req, query) => <RequestCard request={req} searchQuery={query} />}
        renderListItem={(req, query) => <RequestListItem request={req} searchQuery={query} />}
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
        type="request"
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </>
  );
};
