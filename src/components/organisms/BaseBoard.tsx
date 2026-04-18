import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { ErrorBanner } from '../molecules/ErrorBanner';

interface BaseBoardProps<T> {
  title: string;
  table: string;
  searchPlaceholder: string;
  postButtonText: string;
  emptyMessage: string;
  onPostClick: () => void;
  renderGridItem: (item: T) => React.ReactNode;
  renderListItem: (item: T) => React.ReactNode;
  filterFn: (item: T, query: string) => boolean;
  refreshTrigger?: number;
}

export function BaseBoard<T extends { id: string }>({
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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredItems = items.filter(item => filterFn(item, searchQuery));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <ErrorBanner message={error || ''} onDismiss={() => setError(null)} />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <Button
            className="gap-2"
            size="sm"
            onClick={onPostClick}
          >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className={
          view === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }>
          {filteredItems.map((item) => (
            <React.Fragment key={item.id}>
              {view === 'grid' ? renderGridItem(item) : renderListItem(item)}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
