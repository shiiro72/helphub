import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { ErrorBanner } from '../molecules/ErrorBanner';
import { useTranslations } from 'next-intl';
import romanianCities from '@/lib/romanian-cities.json';

interface BaseBoardProps<T> {
  title: string;
  table: string;
  searchPlaceholder: string;
  postButtonText: string;
  emptyMessage: string;
  onPostClick: () => void;
  renderGridItem: (item: T, query: string) => React.ReactNode;
  renderListItem: (item: T, query: string) => React.ReactNode;
  filterFn: (
    item: T,
    filters: {
      query: string;
      city: string;
      startDate: string;
      startTime: string;
    },
  ) => boolean;
  refreshTrigger?: number;
}

export function BaseBoard<
  T extends { id: string; date_posted: string; start_datetime?: string | null },
>({
  title,
  table,
  searchPlaceholder,
  postButtonText,
  emptyMessage,
  onPostClick,
  renderGridItem,
  renderListItem,
  filterFn,
  refreshTrigger = 0,
}: BaseBoardProps<T>) {
  const t = useTranslations();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'start_datetime'>('start_datetime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const supabase = createClient();

      // Fetch blocked users to filter them out
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: blocks } = await supabase
          .from('blocks')
          .select('blocked_id, blocker_id')
          .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

        if (blocks) {
          const ids = new Set<string>();
          blocks.forEach((b: any) => {
            if (b.blocker_id === user.id) ids.add(b.blocked_id);
            else ids.add(b.blocker_id);
          });
          setBlockedUserIds(ids);
        }
      }

      const { data, error } = await supabase
        .from(table)
        .select('*, profiles(*)')
        .order('start_datetime', { ascending: false });

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        setError(`Failed to fetch ${table.replace('_', ' ')}.`);
      } else {
        setItems(data as T[]);
      }
      setLoading(false);
    };

    fetchItems();
  }, [table, refreshTrigger]);

  const filteredItems = items
    .filter((item: any) => {
      if (blockedUserIds.has(item.user_id)) return false;
      return filterFn(item, {
        query: searchQuery,
        city: cityFilter,
        startDate: startDateFilter,
        startTime: startTimeFilter,
      });
    })
    .sort((a, b) => {
      const valA = a[sortBy] ? new Date(a[sortBy] as string).getTime() : 0;
      const valB = b[sortBy] ? new Date(b[sortBy] as string).getTime() : 0;

      if (sortOrder === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 shrink-0 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-brand-text-main">{title}</h2>
          <ErrorBanner message={error || ''} onDismiss={() => setError(null)} />
        </div>

        <div className="space-y-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-brand-text-secondary">
              {t('search')}
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary"
                size={16}
              />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-brand-text-secondary">
              {t('location')}
            </label>
            <Input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCityFilter(val);
                const found = romanianCities.find((c) => `${c.name} (${c.county})` === val);
                if (found) {
                  setCityFilter(found.name);
                }
              }}
              className="bg-brand-background text-sm"
              list="filter-cities-list"
            />
            <datalist id="filter-cities-list">
              {romanianCities.map((c) => (
                <option key={`filter-${c.name}-${c.county}`} value={`${c.name} (${c.county})`} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-brand-text-secondary">
              {t('start_date_time')}
            </label>
            <Input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="bg-brand-background text-sm"
              title="Filter by required start date"
            />
            <Input
              type="time"
              value={startTimeFilter}
              onChange={(e) => setStartTimeFilter(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="bg-brand-background text-sm"
              title="Filter by required start time"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setCityFilter('');
              setStartDateFilter('');
              setStartTimeFilter('');
            }}
            className="w-full text-xs"
          >
            {t('clear_filters')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="grow space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-lg p-1 shadow-sm">
              <span className="text-xs font-medium text-brand-text-secondary px-2">
                {t('sort_by')}:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-transparent text-sm focus:outline-none px-2 py-1 text-brand-text-main"
              >
                <option value="asc">{t('ascending')}</option>
                <option value="desc">{t('descending')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <Button className="gap-2" size="md" variant="primary" onClick={onPostClick}>
              <Plus size={18} />
              {postButtonText}
            </Button>

            <div className="flex items-center gap-2 bg-brand-border/30 p-1 rounded-lg">
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
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-brand-surface animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div
            className={
              view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'
            }
          >
            {filteredItems.map((item) => (
              <React.Fragment key={item.id}>
                {view === 'grid'
                  ? renderGridItem(item, searchQuery)
                  : renderListItem(item, searchQuery)}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-brand-text-secondary">{emptyMessage}</p>
          </div>
        )}
      </main>
    </div>
  );
}
