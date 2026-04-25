import React from 'react';
import { User, MessageSquare, Clock, Edit2, Trash2 } from 'lucide-react';
import { HelpOffer } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { Highlight } from '../atoms/Highlight';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';

interface OfferListItemProps {
  offer: HelpOffer;
  searchQuery?: string;
  onEdit?: (offer: HelpOffer) => void;
  onDelete?: (offer: HelpOffer) => void;
}

export const OfferListItem: React.FC<OfferListItemProps> = ({
  offer,
  searchQuery = '',
  onEdit,
  onDelete,
}) => {
  const t = useTranslations();
  const { user } = useAuth();

  const isOwner = user?.id === offer.user_id;

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

  const isMatch =
    searchQuery &&
    (offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${
        isMatch ? 'bg-yellow-50/50 border-yellow-200' : 'bg-brand-surface border-brand-border'
      }`}
    >
      <div className="grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-brand-text-main truncate">
              <Highlight text={offer.title} query={searchQuery} />
            </h3>
            {offer.reward_offer && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-secondary text-white font-medium whitespace-nowrap">
                {t('reward')}: {offer.reward_offer}
              </span>
            )}
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-background text-brand-text-secondary font-medium whitespace-nowrap">
            {offer.city
              ? `${offer.city}${offer.country ? `, ${offer.country}` : ''}`
              : offer.offer_location || 'Remote'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-brand-text-secondary text-sm line-clamp-1">
            <Highlight text={offer.content} query={searchQuery} />
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs text-brand-text-secondary">
            <User size={12} className="mr-1.5" />
            <span className="font-medium mr-1 text-brand-text-main truncate max-w-[100px]">
              {offer.profiles?.username || 'Anonymous'}
            </span>
            <VerificationBadge
              isVerified={offer.profiles?.is_verified}
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
              onClick={() => onEdit?.(offer)}
              className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
              aria-label="Edit offer"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => onDelete?.(offer)}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              aria-label="Delete offer"
            >
              <Trash2 size={20} />
            </button>
          </>
        ) : (
          <Link
            href={`/messages?userId=${offer.user_id}`}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="Message offerer"
          >
            <MessageSquare size={20} />
          </Link>
        )}
      </div>
    </div>
  );
};
