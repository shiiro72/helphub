import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../atoms/Button';
import { NavLink } from '../molecules/NavLink';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User, Menu, X, Settings, Shield, MessageCircle } from 'lucide-react';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { SupportTicketModal } from './SupportTicketModal';
import { Profile } from '@/lib/types';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../molecules/LanguageSwitcher';
import { useAuth } from '@/lib/hooks/useAuth';

export function Navbar() {
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <nav className="border-b border-brand-border bg-brand-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold tracking-tighter">
                HelpHub
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <NavLink href="/requests">{t('browse_requests')}</NavLink>
                <NavLink href="/offers">{t('browse_offers')}</NavLink>
                {user && <NavLink href="/archive">{t('archive')}</NavLink>}
                {user && <NavLink href="/messages">{t('messages')}</NavLink>}
                {profile?.role === 'admin' && (
                  <NavLink href="/admin">
                    <div className="flex items-center gap-1">
                      <Shield size={16} />
                      {t('admin_board')}
                    </div>
                  </NavLink>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher variant="desktop" />
              {user ? (
                <>
                  <div className="flex items-center gap-2 mr-4 text-sm font-medium text-brand-text-secondary">
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex items-center gap-2 hover:text-brand-text-main transition-colors"
                    >
                      <User size={18} />
                      <span className="flex items-center gap-1">
                        {profile?.username || user.user_metadata?.full_name || user.email}
                        <VerificationBadge isVerified={profile?.is_verified} size={14} className="text-brand-primary" />
                      </span>
                    </button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsSupportOpen(true)}>
                    <MessageCircle size={16} className="mr-2" />
                    {t('support')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      {t('signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-brand-text-secondary hover:text-brand-text-main"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-brand-border p-4 space-y-3 bg-brand-surface">
            <NavLink href="/requests" mobile onClick={() => setIsMenuOpen(false)}>
              {t('browse_requests')}
            </NavLink>

            <NavLink href="/offers" mobile onClick={() => setIsMenuOpen(false)}>
              {t('browse_offers')}
            </NavLink>

            {user && (
              <NavLink href="/archive" mobile onClick={() => setIsMenuOpen(false)}>
                {t('archive')}
              </NavLink>
            )}

            {user && (
              <NavLink href="/messages" mobile onClick={() => setIsMenuOpen(false)}>
                {t('messages')}
              </NavLink>
            )}

            {profile?.role === 'admin' && (
              <NavLink href="/admin" mobile onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-1">
                  <Shield size={16} />
                  {t('admin_board')}
                </div>
              </NavLink>
            )}

            <LanguageSwitcher variant="mobile" onLanguageChange={() => setIsMenuOpen(false)} />

            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-brand-text-secondary hover:text-brand-text-main transition-colors"
                >
                  <User size={18} />
                  <span className="flex items-center gap-1">
                    {profile?.username || user.user_metadata?.full_name || user.email}
                    <VerificationBadge isVerified={profile?.is_verified} size={14} className="text-brand-primary" />
                  </span>
                </button>
                <Button
                  variant="outline"
                  size="full"
                  onClick={() => {
                    setIsSupportOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <MessageCircle size={16} className="mr-2" />
                  {t('support')}
                </Button>
                <Button variant="outline" size="full" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" className="w-full">
                  <Button variant="outline" size="full">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button variant="primary" size="full">
                    {t('signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {profile?.is_restricted && (
          <div className="bg-red-600 text-white text-center py-2 text-sm font-medium">
            {t('restricted_account_warning')}
          </div>
        )}
      </nav>
      <ProfileSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {user && (
        <SupportTicketModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
          userId={user.id}
        />
      )}
    </>
  );
}
