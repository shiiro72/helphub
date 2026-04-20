import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { ErrorBanner } from '../molecules/ErrorBanner';
import { useTranslations } from 'next-intl';

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
      country: string;
      dateRange: string;
      startDate: string;
      startTime: string;
    },
  ) => boolean;
  refreshTrigger?: number;
}

export function BaseBoard<T extends { id: string; date_posted: string; start_datetime?: string | null }>({
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
  const [countryFilter, setCountryFilter] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'
  const [startDateFilter, setStartDateFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date_posted' | 'start_datetime'>('date_posted');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from(table)
        .select('*, profiles(*)')
        .order('date_posted', { ascending: false });

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
    .filter((item) =>
      filterFn(item, {
        query: searchQuery,
        city: cityFilter,
        country: countryFilter,
        dateRange,
        startDate: startDateFilter,
        startTime: startTimeFilter,
      }),
    )
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
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <ErrorBanner message={error || ''} onDismiss={() => setError(null)} />
        </div>

        <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t('search')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t('location')}</label>
            <Input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-white dark:bg-zinc-900 text-sm"
            />
            <Input
              placeholder="Filter by country..."
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-white dark:bg-zinc-900 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t('posted_date')}</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full h-10 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
            >
              <option value="all">{t('all_time')}</option>
              <option value="today">{t('today')}</option>
              <option value="week">{t('past_week')}</option>
              <option value="month">{t('past_month')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t('start_date_time')}</label>
            <Input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="bg-white dark:bg-zinc-900 text-sm"
              title="Filter by required start date"
            />
            <Input
              type="time"
              value={startTimeFilter}
              onChange={(e) => setStartTimeFilter(e.target.value)}
              className="bg-white dark:bg-zinc-900 text-sm"
              title="Filter by required start time"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setCityFilter('');
              setCountryFilter('');
              setDateRange('all');
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
      <main className="flex-grow space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2">{t('sort_by')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date_posted' | 'start_datetime')}
                className="bg-transparent text-sm focus:outline-none px-2 py-1"
              >
                <option value="date_posted">{t('posted_date')}</option>
                <option value="start_datetime">{t('start_date')}</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-transparent text-sm focus:outline-none border-l border-zinc-200 dark:border-zinc-800 px-2 py-1"
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                : 'flex flex-col gap-4'
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
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
          </div>
        )}
      </main>
    </div>
  );
}
