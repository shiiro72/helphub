import React, { useState } from 'react';
import { Calendar, User, MessageSquare, Languages, Loader2, Clock, Edit2, Trash2 } from 'lucide-react';
import { HelpRequest } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { Highlight } from '../atoms/Highlight';
import { translateText } from '@/lib/translate';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';

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
  onDelete
}) => {
  const t = useTranslations();
  const { locale } = useRouter();
  const { user } = useAuth();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isOwner = user?.id === request.user_id;

  const handleTranslate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (translatedContent) {
      setTranslatedContent(null);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(request.content, locale || 'en');
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };
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

  const isMatch = searchQuery && (
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${
      isMatch
        ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
    }`}>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            <Highlight text={request.title} query={searchQuery} />
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
            {request.city ? `${request.city}${request.country ? `, ${request.country}` : ''}` : (request.request_location || 'Remote')}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-1">
            {translatedContent ? (
              translatedContent
            ) : (
              <Highlight text={request.content} query={searchQuery} />
            )}
          </p>
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 flex-shrink-0"
          >
            {isTranslating ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Languages size={10} />
            )}
            {translatedContent ? t('show_original') : t('translate')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <User size={12} className="mr-1.5" />
            <span className="font-medium mr-1 text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">
              {request.profiles?.username || 'Anonymous'}
            </span>
            <VerificationBadge isVerified={request.profiles?.is_verified} size={10} className="text-blue-500" />
          </div>

          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar size={12} className="mr-1.5" />
            <span>{date}</span>
          </div>

          {startStr && (
            <div className="flex items-center text-[10px] text-zinc-500 dark:text-zinc-400">
              <Clock size={10} className="mr-1" />
              <span className="truncate max-w-[150px]">
                {startStr} {endStr ? `— ${endStr}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isOwner ? (
          <>
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
          <Link
            href={`/messages?userId=${request.user_id}`}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="Message requester"
          >
            <MessageSquare size={20} />
          </Link>
        )}
      </div>
    </div>
  );
};
