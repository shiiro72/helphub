import React from 'react';
import { MapPin, Calendar, User, MessageSquare } from 'lucide-react';
import { HelpRequest } from '@/lib/types';
import Link from 'next/link';
import { VerificationBadge } from '../atoms/VerificationBadge';

interface RequestCardProps {
  request: HelpRequest;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const date = new Date(request.date_posted).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
          {request.title}
        </h3>
        <Link
          href={`/messages?userId=${request.user_id}`}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          aria-label="Message requester"
        >
          <MessageSquare size={20} />
        </Link>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow">
        {request.content}
      </p>

      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
          <User size={14} className="mr-2" />
          <span className="font-medium mr-1 text-zinc-700 dark:text-zinc-300">
            {request.profiles?.username || 'Anonymous'}
          </span>
          <VerificationBadge isVerified={request.profiles?.is_verified} size={12} className="text-blue-500 ml-1" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin size={14} className="mr-1" />
            <span>{request.request_location || 'Remote'}</span>
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
