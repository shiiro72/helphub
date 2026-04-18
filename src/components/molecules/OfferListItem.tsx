import React from 'react';
import { Calendar, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { HelpOffer } from '@/lib/types';
import Link from 'next/link';

interface OfferListItemProps {
  offer: HelpOffer;
}

export const OfferListItem: React.FC<OfferListItemProps> = ({ offer }) => {
  const date = new Date(offer.date_posted).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {offer.title}
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
            {offer.offer_location || 'Remote'}
          </span>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-1 mb-2">
          {offer.content}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <User size={12} className="mr-1.5" />
            <span className="font-medium mr-1 text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">
              {offer.profiles?.username || 'Anonymous'}
            </span>
            {offer.profiles?.is_verified && (
              <CheckCircle2 size={10} className="text-blue-500" />
            )}
          </div>

          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar size={12} className="mr-1.5" />
            <span>{date}</span>
          </div>
        </div>
      </div>

      <Link
        href={`/messages?userId=${offer.user_id}`}
        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0"
        aria-label="Message offerer"
      >
        <MessageSquare size={20} />
      </Link>
    </div>
  );
};
