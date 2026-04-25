import React, { useState } from 'react';
import {
  User,
  MessageSquare,
  Clock,
  Edit2,
  Trash2,
  Hand,
  Users,
  Loader2,
} from 'lucide-react';
import { HelpRequest } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { Highlight } from '../atoms/Highlight';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { VolunteerList } from './VolunteerList';
import { useVolunteer } from '@/lib/hooks/useVolunteer';

interface RequestListItemProps {
  request: HelpRequest;
  searchQuery?: string;
  onEdit?: (request: HelpRequest) => void;
  onDelete?: (request: HelpRequest) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  searchQuery = '',
  onEdit,
  onDelete,
}) => {
  const t = useTranslations();
  const { user } = useAuth();
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  const isOwner = user?.id === request.user_id;

  const {
    isVolunteering,
    volunteerStatus,
    confirmedCount,
    isLoading: isVolunteerLoading,
    toggleVolunteer: handleVolunteerToggle,
  } = useVolunteer(request.id);

  const formatDatetime = (dt: string | null | undefined) => {
    if (!dt) return null;
    return new Date(dt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startStr = formatDatetime(request.start_datetime);
  const endStr = formatDatetime(request.end_datetime);

  const isMatch =
    searchQuery &&
    (request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden ${
        isMatch ? 'bg-yellow-50/50 border-yellow-200' : 'bg-brand-surface border-brand-border'
      }`}
    >
      <div className="absolute top-0 right-0">
        <div className="bg-brand-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-md">
          {t('request').toUpperCase()}
        </div>
      </div>
      <div className="grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-brand-text-main truncate">
              <Highlight text={request.title} query={searchQuery} />
            </h3>
            {request.reward_offer && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-secondary text-white font-medium whitespace-nowrap">
                {t('reward')}: {request.reward_offer}
              </span>
            )}
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-background text-brand-text-secondary font-medium whitespace-nowrap">
            {request.city
              ? `${request.city}${request.country ? `, ${request.country}` : ''}`
              : request.request_location || 'Remote'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-brand-text-secondary text-sm line-clamp-1">
            <Highlight text={request.content} query={searchQuery} />
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs text-brand-text-secondary">
            <User size={12} className="mr-1.5" />
            <span className="font-medium mr-1 text-brand-text-main truncate max-w-[100px]">
              {request.profiles?.username || 'Anonymous'}
            </span>
            <VerificationBadge
              isVerified={request.profiles?.is_verified}
              size={10}
              className="text-brand-primary"
            />
          </div>

          {startStr && (
            <div className="flex items-center text-[10px] text-brand-text-secondary">
              <Clock size={10} className="mr-1" />
              <span className="truncate max-w-[150px]">
                {startStr} {endStr ? `— ${endStr}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isOwner ? (
          <>
            <button
              onClick={() => setShowVolunteerModal(true)}
              className="p-2 text-brand-text-secondary hover:text-brand-primary transition-colors relative"
              aria-label="Manage volunteers"
              title={t('manage_volunteers')}
            >
              <Users size={20} />
              {confirmedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {confirmedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onEdit?.(request)}
              className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
              aria-label="Edit request"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => onDelete?.(request)}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              aria-label="Delete request"
            >
              <Trash2 size={20} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleVolunteerToggle(request.max_volunteers || null)}
              disabled={isVolunteerLoading}
              className={`p-2 transition-all flex items-center gap-1 rounded-md border ${
                isVolunteering
                  ? volunteerStatus === 'waitlisted'
                    ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                    : 'bg-brand-primary/10 border-brand-primary text-brand-primary hover:bg-brand-primary/20'
                  : confirmedCount >= (request.max_volunteers || Infinity)
                    ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                    : 'bg-brand-background border-brand-border text-brand-text-secondary hover:bg-brand-primary/10 hover:border-brand-primary hover:text-brand-primary'
              }`}
              title={
                isVolunteering
                  ? t('unvolunteer')
                  : confirmedCount >= (request.max_volunteers || Infinity)
                    ? t('join_waitlist')
                    : t('volunteer')
              }
            >
              {isVolunteerLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Hand size={18} />
              )}
              <span className="text-[10px] font-bold">
                {confirmedCount}
                {request.max_volunteers ? `/${request.max_volunteers}` : ''}
                {isVolunteering && volunteerStatus === 'waitlisted' && ` (${t('waitlisted')})`}
                {!isVolunteering &&
                  confirmedCount >= (request.max_volunteers || Infinity) &&
                  ` (${t('waitlist')})`}
              </span>
            </button>
            <Link
              href={`/messages?userId=${request.user_id}`}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Message requester"
            >
              <MessageSquare size={20} />
            </Link>
          </>
        )}
      </div>

      {showVolunteerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-brand-surface rounded-2xl w-full max-w-md shadow-2xl p-6">
            <VolunteerList
              request={{ ...request, confirmed_count: confirmedCount }}
              onClose={() => setShowVolunteerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
