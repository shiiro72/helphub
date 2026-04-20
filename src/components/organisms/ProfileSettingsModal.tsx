import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, User, Trash2, Save } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { ConfirmationModal } from '../molecules/ConfirmationModal';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { ErrorBanner } from '../molecules/ErrorBanner';
import { useTranslations } from 'next-intl';
import { StarRating } from '../atoms/StarRating';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          setUsername(data.username);
          setImageUrl(data.image_url || '');
        }
        if (error) {
          setError(error.message);
        }
      }
    }

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const handleUpdateClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdateConfirmOpen(true);
  };

  const handleUpdateConfirm = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username,
        image_url: imageUrl || null,
      })
      .eq('id', profile?.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setIsUpdateConfirmOpen(false);
      setLoading(false);
      onClose();
      window.location.reload(); // Refresh to show changes
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    // RLS and CASCADE should handle help_requests and help_offers deletion
    const { error: deleteError } = await supabase.from('profiles').delete().eq('id', profile?.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-modal-title"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h2
                id="profile-settings-modal-title"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                {t('profile_settings')}
              </h2>
              <VerificationBadge isVerified={profile?.is_verified} size={20} />
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleUpdateClick} className="p-6 space-y-6">
            <ErrorBanner message={error || ''} onDismiss={() => setError(null)} />

            <div className="flex flex-col items-center gap-4 mb-6">
              {profile && (
                <div className="mb-2">
                  <StarRating
                    rating={profile.trust_rank || 0}
                    totalRatings={profile.total_ratings || 0}
                    size={20}
                    showCount
                  />
                </div>
              )}
              <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                {imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image src={imageUrl} alt="Profile" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <User size={48} className="text-zinc-400" />
                )}
              </div>
              <p className="text-xs text-zinc-500">{t('image_preview')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  placeholder={t('username_placeholder')}
                  value={username}
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">{t('image_url')}</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  autoComplete="off"
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  <Save size={18} />
                  {t('save_changes')}
                </Button>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={loading}
                >
                  <Trash2 size={18} />
                  {t('delete_profile')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleUpdateConfirm}
        title={t('confirm_update_title')}
        message={
          <div className="space-y-2">
            <p>{t('confirm_update_message')}</p>
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm">
              <p>
                <strong>{t('username')}:</strong> {username}
              </p>
              {imageUrl && (
                <p className="truncate">
                  <strong>{t('image_url')}:</strong> {imageUrl}
                </p>
              )}
            </div>
          </div>
        }
        confirmText={t('update_profile_button')}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('delete_profile_title')}
        message={
          <div className="space-y-3">
            <p className="font-semibold text-red-600">{t('delete_profile_warning')}</p>
            <p>{t('delete_profile_message')}</p>
          </div>
        }
        confirmText={t('confirm_delete_button')}
        variant="danger"
        isLoading={loading}
      />
    </>
  );
};
