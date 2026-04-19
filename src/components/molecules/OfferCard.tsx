import React, { useState } from 'react';
import { MapPin, Calendar, User, MessageSquare, Languages, Loader2, Clock, Edit2, Trash2 } from 'lucide-react';
import { HelpOffer } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { StarRating } from '../atoms/StarRating';
import { Highlight } from '../atoms/Highlight';
import { translateText } from '@/lib/translate';
import { useRouter } from 'next/router';
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
  const { locale } = useRouter();
  const { user } = useAuth();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isOwner = user?.id === offer.user_id;

  const handleTranslate = async () => {
    if (translatedContent) {
      setTranslatedContent(null);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(offer.content, locale || 'en');
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };
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
    <div className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full ${
      isMatch
        ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
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
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3">
          {translatedContent ? (
            translatedContent
          ) : (
            <Highlight text={offer.content} query={searchQuery} />
          )}
        </p>
        {offer.reward_offer && (
          <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-fit">
            Reward: {offer.reward_offer}
          </div>
        )}
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {isTranslating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Languages size={12} />
          )}
          {translatedContent ? t('show_original') : t('translate')}
        </button>
      </div>

      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <User size={14} className="mr-2" />
            <span className="font-medium mr-1 text-zinc-700 dark:text-zinc-300">
              {offer.profiles?.username || 'Anonymous'}
            </span>
            <VerificationBadge isVerified={offer.profiles?.is_verified} size={12} className="text-blue-500 ml-1" />
          </div>
          <StarRating
            rating={offer.profiles?.trust_rank || 0}
            totalRatings={offer.profiles?.total_ratings || 0}
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
            <MapPin size={14} className="mr-1" />
            <span className="truncate max-w-[150px]">
              {offer.city ? `${offer.city}${offer.country ? `, ${offer.country}` : ''}` : (offer.offer_location || 'Remote')}
            </span>
          </div>
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar size={14} className="mr-1" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
