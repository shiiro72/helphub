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

  const filterFn = (req: HelpRequest, query: string) =>
    req.title.toLowerCase().includes(query.toLowerCase()) ||
    req.content.toLowerCase().includes(query.toLowerCase()) ||
    (req.request_location || '').toLowerCase().includes(query.toLowerCase());

  return (
    <>
      <BaseBoard<HelpRequest>
        title="Requests"
        table="help_requests"
        searchPlaceholder="Search requests..."
        postButtonText="Post Request"
        emptyMessage="No help requests found."
        onPostClick={handlePostClick}
        renderGridItem={(req) => <RequestCard request={req} />}
        renderListItem={(req) => <RequestListItem request={req} />}
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
