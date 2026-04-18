import React, { useState } from 'react';
import { HelpRequest } from '@/lib/types';
import { RequestCard } from '../molecules/RequestCard';
import { RequestListItem } from '../molecules/RequestListItem';
import { PostHelpModal } from './PostHelpModal';
import { BaseBoard } from './BaseBoard';

export const RequestBoard: React.FC = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        onPostClick={() => setIsPostModalOpen(true)}
        renderGridItem={(req) => <RequestCard request={req} />}
        renderListItem={(req) => <RequestListItem request={req} />}
        filterFn={filterFn}
        refreshTrigger={refreshTrigger}
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
