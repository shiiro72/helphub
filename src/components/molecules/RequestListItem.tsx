import React, { useState } from 'react';
import { Calendar, User, MessageSquare, Languages, Loader2 } from 'lucide-react';
import { HelpRequest } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { translateText } from '@/lib/translate';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface RequestListItemProps {
  request: HelpRequest;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({ request }) => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {request.title}
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
            {request.request_location || 'Remote'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-1">
            {translatedContent || request.content}
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
        </div>
      </div>

      <Link
        href={`/messages?userId=${request.user_id}`}
        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0"
        aria-label="Message requester"
      >
        <MessageSquare size={20} />
      </Link>
    </div>
  );
};
