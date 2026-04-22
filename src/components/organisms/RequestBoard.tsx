import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { HelpRequest } from '@/lib/types';
import { RequestCard } from '../molecules/RequestCard';
import { RequestListItem } from '../molecules/RequestListItem';
import { PostHelpModal } from './PostHelpModal';
import { BaseBoard } from './BaseBoard';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { ConfirmationModal } from '../molecules/ConfirmationModal';

export const RequestBoard: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingRequest, setEditingRequest] = useState<HelpRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<HelpRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePostClick = () => {
    setEditingRequest(null);
    if (user) {
      setIsPostModalOpen(true);
    } else {
      setIsLoginPromptOpen(true);
    }
  };

  const handleEditClick = (req: HelpRequest) => {
    setEditingRequest(req);
    setIsPostModalOpen(true);
  };

  const handleDeleteClick = (req: HelpRequest) => {
    setDeletingRequest(req);
  };

  const confirmDelete = async () => {
    if (!deletingRequest) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('help_requests').delete().eq('id', deletingRequest.id);

    if (error) {
      console.error('Error deleting request:', error);
    } else {
      setRefreshTrigger((prev) => prev + 1);
      setDeletingRequest(null);
    }
    setIsDeleting(false);
  };

  const filterFn = (
    req: HelpRequest,
    filters: {
      query: string;
      city: string;
      startDate: string;
      startTime: string;
    },
  ) => {
    const { query, city, startDate, startTime } = filters;

    // Search filter
    const matchesSearch =
      req.title.toLowerCase().includes(query.toLowerCase()) ||
      req.content?.toLowerCase().includes(query.toLowerCase());

    // City filter
    const matchesCity = !city || (req.city || '').toLowerCase().includes(city.toLowerCase());

    // Start date & time filter (required start)
    let matchesStartDate = true;
    if (startDate && req.start_datetime) {
      const filterDateTimeStr = startTime ? `${startDate}T${startTime}` : `${startDate}T00:00`;
      const filterDate = new Date(filterDateTimeStr);
      const reqStartDate = new Date(req.start_datetime);
      matchesStartDate = reqStartDate >= filterDate;
    }

    // Exclude expired posts
    let isNotExpired = true;
    if (req.end_datetime) {
      const endDateTime = new Date(req.end_datetime);
      const now = new Date();
      isNotExpired = endDateTime > now;
    }

    return matchesSearch && matchesCity && matchesStartDate && isNotExpired;
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
        renderGridItem={(req, query) => (
          <RequestCard
            request={req}
            searchQuery={query}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
        renderListItem={(req, query) => (
          <RequestListItem
            request={req}
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
        isOpen={!!deletingRequest}
        onClose={() => setDeletingRequest(null)}
        onConfirm={confirmDelete}
        title="Delete Request"
        message="Are you sure you want to delete this help request? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <PostHelpModal
        type="request"
        isOpen={isPostModalOpen}
        initialData={editingRequest}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingRequest(null);
        }}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </>
  );
};
