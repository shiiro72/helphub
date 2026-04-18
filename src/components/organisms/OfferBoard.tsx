import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HelpOffer } from '@/lib/types';
import { OfferCard } from '../molecules/OfferCard';
import { OfferListItem } from '../molecules/OfferListItem';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { PostOfferModal } from './PostOfferModal';
import { Plus } from 'lucide-react';

export const OfferBoard: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('help_offers')
      .select('*, profiles(*)')
      .order('date_posted', { ascending: false });

    if (error) {
      console.error('Error fetching help offers:', error);
    } else {
      setOffers(data as HelpOffer[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offer.offer_location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input
            placeholder="Search offers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <Button
            className="gap-2"
            size="sm"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Plus size={18} />
            Post Offer
          </Button>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
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
      </div>

      <PostOfferModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={fetchOffers}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length > 0 ? (
        <div className={
          view === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }>
          {filteredOffers.map((offer) => (
            view === 'grid'
              ? <OfferCard key={offer.id} offer={offer} />
              : <OfferListItem key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 dark:text-zinc-400">No help offers found.</p>
        </div>
      )}
    </div>
  );
};
