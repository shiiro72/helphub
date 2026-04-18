import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HelpRequest } from '@/lib/types';
import { RequestCard } from '../molecules/RequestCard';
import { RequestListItem } from '../molecules/RequestListItem';
import { Input } from '../atoms/Input';

export const RequestBoard: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('help_requests')
        .select('*, profiles(*)')
        .order('date_posted', { ascending: false });

      if (error) {
        console.error('Error fetching help requests:', error);
      } else {
        setRequests(data as HelpRequest[]);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req =>
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.request_location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input
            placeholder="Search requests..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-md transition-all ${
              view === 'grid'
                ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-all ${
              view === 'list'
                ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            title="List view"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className={
          view === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }>
          {filteredRequests.map((request) => (
            view === 'grid'
              ? <RequestCard key={request.id} request={request} />
              : <RequestListItem key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 dark:text-zinc-400">No help requests found.</p>
        </div>
      )}
    </div>
  );
};
