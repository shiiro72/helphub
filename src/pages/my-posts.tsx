import { Navbar } from '@/components/organisms/Navbar';
import { useTranslations } from 'next-intl';
import { GetStaticProps } from 'next';
import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/atoms/Input';
import { RequestCard } from '@/components/molecules/RequestCard';
import { RequestListItem } from '@/components/molecules/RequestListItem';
import { OfferCard } from '@/components/molecules/OfferCard';
import { OfferListItem } from '@/components/molecules/OfferListItem';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';
import { PostHelpModal } from '@/components/organisms/PostHelpModal';
import { ConfirmationModal } from '@/components/molecules/ConfirmationModal';

type MyPostItem = (HelpRequest | HelpOffer) & { type: 'request' | 'offer' };
type StatusFilter = 'all' | 'active' | 'archived';

export default function MyPostsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [items, setItems] = useState<MyPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MyPostItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MyPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchMyPosts = async () => {
      setLoading(true);
      const supabase = createClient();

      const [requests, offers] = await Promise.all([
        supabase
          .from('help_requests')
          .select('*, profiles(*)')
          .eq('user_id', user.id)
          .order('date_posted', { ascending: false }),
        supabase
          .from('help_offers')
          .select('*, profiles(*)')
          .eq('user_id', user.id)
          .order('date_posted', { ascending: false }),
      ]);

      const myRequests = ((requests.data ?? []) as HelpRequest[]).map((r) => ({
        ...r,
        type: 'request' as const,
      }));
      const myOffers = ((offers.data ?? []) as HelpOffer[]).map((o) => ({
        ...o,
        type: 'offer' as const,
      }));

      const allItems = [...myRequests, ...myOffers].sort(
        (a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime(),
      );

      setItems(allItems);
      setLoading(false);
    };

    fetchMyPosts();
  }, [user, authLoading, router, refreshTrigger]);

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-brand-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-brand-text-secondary">{t('processing')}</p>
        </main>
      </div>
    );
  }

  const handleEditClick = (item: MyPostItem) => {
    setEditingItem(item);
    setIsPostModalOpen(true);
  };

  const handleDeleteClick = (item: MyPostItem) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    const supabase = createClient();
    const table = deletingItem.type === 'request' ? 'help_requests' : 'help_offers';
    const { error } = await supabase.from(table).delete().eq('id', deletingItem.id);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      setRefreshTrigger((prev) => prev + 1);
      setDeletingItem(null);
    }
    setIsDeleting(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;

    const now = new Date();
    const isExpired = item.end_datetime ? new Date(item.end_datetime) < now : false;

    if (statusFilter === 'active') return !isExpired;
    if (statusFilter === 'archived') return isExpired;

    return true;
  });

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-brand-text-main tracking-tight flex items-center gap-3">
            <FileText size={32} />
            {t('my_posts_title')}
          </h1>
          <p className="text-brand-text-secondary mt-2">{t('my_posts_description')}</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 grow max-w-2xl">
              <div className="relative grow">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary"
                  size={18}
                />
                <Input
                  placeholder={t('search')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-brand-border/30 p-1 rounded-lg self-start">
                {(['all', 'active', 'archived'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-brand-surface shadow-sm text-brand-text-main'
                        : 'text-brand-text-secondary hover:text-brand-text-main'
                    }`}
                  >
                    {t(status)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-brand-border/30 p-1 rounded-lg self-end md:self-auto">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md transition-all ${
                  view === 'grid'
                    ? 'bg-brand-surface shadow-sm text-brand-text-main'
                    : 'text-brand-text-secondary hover:text-brand-text-main'
                }`}
                title="Grid view"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-all ${
                  view === 'list'
                    ? 'bg-brand-surface shadow-sm text-brand-text-main'
                    : 'text-brand-text-secondary hover:text-brand-text-main'
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
                <div key={i} className="h-48 rounded-xl bg-brand-surface animate-pulse" />
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
                      <RequestCard
                        request={item as HelpRequest}
                        searchQuery={searchQuery}
                        onEdit={() => handleEditClick(item)}
                        onDelete={() => handleDeleteClick(item)}
                      />
                    ) : (
                      <RequestListItem
                        request={item as HelpRequest}
                        searchQuery={searchQuery}
                        onEdit={() => handleEditClick(item)}
                        onDelete={() => handleDeleteClick(item)}
                      />
                    )
                  ) : view === 'grid' ? (
                    <OfferCard
                      offer={item as HelpOffer}
                      searchQuery={searchQuery}
                      onEdit={() => handleEditClick(item)}
                      onDelete={() => handleDeleteClick(item)}
                    />
                  ) : (
                    <OfferListItem
                      offer={item as HelpOffer}
                      searchQuery={searchQuery}
                      onEdit={() => handleEditClick(item)}
                      onDelete={() => handleDeleteClick(item)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
              <p className="text-brand-text-secondary">{t('no_requests')}</p>
            </div>
          )}
        </div>
      </main>

      {editingItem && (
        <PostHelpModal
          type={editingItem.type}
          isOpen={isPostModalOpen}
          initialData={editingItem}
          onClose={() => {
            setIsPostModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      <ConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        title={deletingItem?.type === 'request' ? t('delete_request') : t('delete_offer')}
        message={t('delete_post_confirmation')}
        confirmText={t('delete')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
