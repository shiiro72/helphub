import { Navbar } from '@/components/organisms/Navbar';
import { Geist, Geist_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { GetStaticProps } from 'next';
import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Archive } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/atoms/Input';
import { RequestCard } from '@/components/molecules/RequestCard';
import { RequestListItem } from '@/components/molecules/RequestListItem';
import { OfferCard } from '@/components/molecules/OfferCard';
import { OfferListItem } from '@/components/molecules/OfferListItem';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type ArchivedItem = (HelpRequest | HelpOffer) & { type: 'request' | 'offer' };

export default function ArchivePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchArchived = async () => {
      setLoading(true);
      const supabase = createClient();
      const now = new Date().toISOString();

      const [requests, offers] = await Promise.all([
        supabase
          .from('help_requests')
          .select('*, profiles(*)')
          .eq('user_id', user.id)
          .lt('end_datetime', now),
        supabase
          .from('help_offers')
          .select('*, profiles(*)')
          .eq('user_id', user.id)
          .lt('end_datetime', now),
      ]);

      const archivedRequests = ((requests.data ?? []) as HelpRequest[]).map((r) => ({
        ...r,
        type: 'request' as const,
      }));
      const archivedOffers = ((offers.data ?? []) as HelpOffer[]).map((o) => ({
        ...o,
        type: 'offer' as const,
      }));

      const allArchived = [...archivedRequests, ...archivedOffers].sort(
        (a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime(),
      );

      setItems(allArchived);
      setLoading(false);
    };

    fetchArchived();
  }, [user, authLoading, router]);

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div
        className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black font-sans`}
      >
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-zinc-500">{t('processing')}</p>
        </main>
      </div>
    );
  }

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black font-sans`}
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <Archive size={32} />
            {t('archive_title')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">{t('archive_description')}</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <Input
                placeholder={t('search_archive')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredItems.map((item) => (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  {item.type === 'request' ? (
                    view === 'grid' ? (
                      <RequestCard request={item as HelpRequest} searchQuery={searchQuery} />
                    ) : (
                      <RequestListItem request={item as HelpRequest} searchQuery={searchQuery} />
                    )
                  ) : view === 'grid' ? (
                    <OfferCard offer={item as HelpOffer} searchQuery={searchQuery} />
                  ) : (
                    <OfferListItem offer={item as HelpOffer} searchQuery={searchQuery} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 dark:text-zinc-400">{t('no_archived_items')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
