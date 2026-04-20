import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Clock,
  Edit2,
  Trash2,
  UserPlus,
  Users,
  Loader2,
} from 'lucide-react';
import { HelpRequest } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { StarRating } from '../atoms/StarRating';
import { Highlight } from '../atoms/Highlight';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { VolunteerList } from './VolunteerList';
import { useVolunteer } from '@/lib/hooks/useVolunteer';

interface RequestCardProps {
  request: HelpRequest;
  searchQuery?: string;
  onEdit?: (request: HelpRequest) => void;
  onDelete?: (request: HelpRequest) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
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
  const date = new Date(request.date_posted).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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
      className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full ${
        isMatch
          ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            <Highlight text={request.title} query={searchQuery} />
          </h3>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {isOwner ? (
            <>
              <button
                onClick={() => onEdit?.(request)}
                className="text-zinc-400 hover:text-blue-500 transition-colors"
                aria-label="Edit request"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete?.(request)}
                className="text-zinc-400 hover:text-red-500 transition-colors"
                aria-label="Delete request"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVolunteerToggle(request.max_volunteers || null)}
                disabled={isVolunteerLoading}
                className={`transition-all flex items-center gap-1 px-2 py-1 rounded-md border ${
                  isVolunteering
                    ? volunteerStatus === 'waitlisted'
                      ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                      : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                    : confirmedCount >= (request.max_volunteers || Infinity)
                      ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-blue-300 hover:text-blue-600'
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
                  <UserPlus size={18} />
                )}
                <span className="text-xs font-bold">
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
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label="Message requester"
              >
                <MessageSquare size={20} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow mb-6">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3">
          <Highlight text={request.content} query={searchQuery} />
        </p>
        {request.reward_offer && (
          <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-fit">
            Reward: {request.reward_offer}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <User size={14} className="mr-2" />
            <span className="font-medium mr-1 text-zinc-700 dark:text-zinc-300">
              {request.profiles?.username || 'Anonymous'}
            </span>
            <VerificationBadge
              isVerified={request.profiles?.is_verified}
              size={12}
              className="text-blue-500 ml-1"
            />
          </div>
          <StarRating
            rating={request.profiles?.trust_rank || 0}
            totalRatings={request.profiles?.total_ratings || 0}
            size={12}
            showCount
          />
        </div>

        {startStr && (
          <div className="flex items-center text-[11px] text-zinc-500 dark:text-zinc-400">
            <Clock size={12} className="mr-1.5" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {startStr} {endStr ? `— ${endStr}` : ''}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate max-w-[180px]">
              {request.address ? `${request.address}, ` : ''}
              {request.city ? (
                <>
                  {request.city}
                  {request.county ? `, ${request.county}` : ''}
                  {request.country ? ` (${request.country})` : ''}
                </>
              ) : (
                request.request_location || 'Remote'
              )}
            </span>
          </div>
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar size={14} className="mr-1" />
            <span>{date}</span>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowVolunteerModal(true)}
            className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
          >
            <Users size={14} />
            {t('manage_volunteers')} ({confirmedCount})
          </button>
        )}
      </div>

      {showVolunteerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl p-6">
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
