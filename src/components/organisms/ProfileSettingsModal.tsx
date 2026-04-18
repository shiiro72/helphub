import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, User, Trash2, Save } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { ConfirmationModal } from '../molecules/ConfirmationModal';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
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
      const { data: { user } } = await supabase.auth.getUser();

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
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profile?.id);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Profile Settings</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleUpdateClick} className="p-6 space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                {imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <User size={48} className="text-zinc-400" />
                )}
              </div>
              <p className="text-xs text-zinc-500">Preview of your profile picture</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Profile Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  <Save size={18} />
                  Save Changes
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
                  Delete My Profile
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
        title="Confirm Profile Update"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to update your profile with these changes?</p>
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm">
              <p><strong>Username:</strong> {username}</p>
              {imageUrl && <p className="truncate"><strong>Image URL:</strong> {imageUrl}</p>}
            </div>
          </div>
        }
        confirmText="Update Profile"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Profile"
        message={
          <div className="space-y-3">
            <p className="font-semibold text-red-600">This action is permanent and cannot be undone.</p>
            <p>Your profile, all your help requests, offers, and messages will be permanently deleted.</p>
          </div>
        }
        confirmText="Yes, Delete My Profile"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
};
