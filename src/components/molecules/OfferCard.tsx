import React, { useState } from 'react';
import { MapPin, Calendar, User, MessageSquare, Clock, Edit2, Trash2 } from 'lucide-react';
import { HelpOffer } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { StarRating } from '../atoms/StarRating';
import { Highlight } from '../atoms/Highlight';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';

interface OfferCardProps {
  offer: HelpOffer;
  searchQuery?: string;
  onEdit?: (offer: HelpOffer) => void;
  onDelete?: (offer: HelpOffer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  searchQuery = '',
  onEdit,
  onDelete
}) => {
  const t = useTranslations();
  const { user } = useAuth();

  const isOwner = user?.id === offer.user_id;
  const date = new Date(offer.date_posted).toLocaleDateString('en-US', {
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

  const startStr = formatDatetime(offer.start_datetime);
  const endStr = formatDatetime(offer.end_datetime);

  const isMatch = searchQuery && (
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`rounded-2xl border p-5 shadow-ambient hover:shadow-lg transition-all flex flex-col h-full ${
      isMatch
        ? 'bg-brand-secondary-container/10 border-brand-secondary-container'
        : 'bg-brand-surface-container-lowest border-brand-outline-variant'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-brand-text-main line-clamp-1">
            <Highlight text={offer.title} query={searchQuery} />
          </h3>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {isOwner ? (
            <>
              <button
                onClick={() => onEdit?.(offer)}
                className="text-zinc-400 hover:text-blue-500 transition-colors"
                aria-label="Edit offer"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete?.(offer)}
                className="text-zinc-400 hover:text-red-500 transition-colors"
                aria-label="Delete offer"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <Link
              href={`/messages?userId=${offer.user_id}`}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Message offerer"
            >
              <MessageSquare size={20} />
            </Link>
          )}
        </div>
      </div>

      <div className="flex-grow mb-4">
        <p className="text-brand-text-secondary text-sm line-clamp-3">
          <Highlight text={offer.content} query={searchQuery} />
        </p>
        {offer.reward_offer && (
          <div className="mt-2 text-xs font-medium text-brand-text-main bg-brand-secondary px-2 py-1 rounded w-fit">
            Reward: {offer.reward_offer}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-brand-text-secondary">
            <User size={14} className="mr-2" />
            <span className="font-medium mr-1 text-brand-text-main">
              {offer.profiles?.username || 'Anonymous'}
            </span>
            <VerificationBadge isVerified={offer.profiles?.is_verified} size={12} className="text-brand-primary ml-1" />
          </div>
          <StarRating
            rating={offer.profiles?.trust_rank || 0}
            totalRatings={offer.profiles?.total_ratings || 0}
            size={12}
            showCount
          />
        </div>

        {startStr && (
          <div className="flex items-center text-[11px] text-brand-text-secondary">
            <Clock size={12} className="mr-1.5" />
            <span className="font-medium text-brand-text-main">
              {startStr} {endStr ? `— ${endStr}` : ''}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-brand-text-secondary">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate max-w-[180px]">
              {offer.address ? `${offer.address}, ` : ''}
              {offer.city ? (
                <>
                  {offer.city}
                  {offer.county ? `, ${offer.county}` : ''}
                  {offer.country ? ` (${offer.country})` : ''}
                </>
              ) : (offer.offer_location || 'Remote')}
            </span>
          </div>
          <div className="flex items-center text-xs text-brand-text-secondary">
            <Calendar size={14} className="mr-1" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
