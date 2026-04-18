import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../atoms/Button';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User, Menu, X, Settings } from 'lucide-react';
import { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter">
              HelpHub
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/requests" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                Browse Requests
              </Link>
              <Link href="/offers" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                Browse Offers
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 mr-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <User size={18} />
                  <span>{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                  <Settings size={16} className="mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-black">
          <Link
            href="/requests"
            className="block px-2 py-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Browse Requests
          </Link>

          <Link
            href="/offers"
            className="block px-2 py-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Browse Offers
          </Link>

          {user ? (
            <>
              <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <User size={18} />
                <span>{user.email}</span>
              </div>
              <Button variant="outline" size="full" onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}>
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="full" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" size="full">Login</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="primary" size="full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
}
