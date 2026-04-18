import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { Textarea } from '../atoms/Textarea';
import { ErrorBanner } from '../molecules/ErrorBanner';
import { createClient } from '@/lib/supabase/client';

interface PostHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'request' | 'offer';
}

export const PostHelpModal: React.FC<PostHelpModalProps> = ({ isOpen, onClose, onSuccess, type }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRequest = type === 'request';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError(`You must be logged in to post a ${type}.`);
      setLoading(false);
      return;
    }

    const table = isRequest ? 'help_requests' : 'help_offers';
    const payload: Record<string, string | null> = {
      user_id: user.id,
      title,
      content,
    };

    if (isRequest) {
      payload.request_location = location || 'Remote';
      payload.reward_offer = reward || null;
    } else {
      payload.offer_location = location || 'Remote';
    }

    const { error: insertError } = await supabase
      .from(table)
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
    } else {
      onSuccess();
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setLocation('');
      setReward('');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {isRequest ? 'Post a Request' : 'Post an Offer'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorBanner message={error || ''} onDismiss={() => setError(null)} />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={isRequest ? "What do you need help with?" : "What can you help with?"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              placeholder={isRequest ? "Describe your request in detail..." : "Describe your offer in detail..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className={`grid ${isRequest ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g. New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            {isRequest && (
              <div className="space-y-2">
                <Label htmlFor="reward">Reward (Optional)</Label>
                <Input
                  id="reward"
                  placeholder="e.g. Coffee, $20"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Posting...' : (isRequest ? 'Post Request' : 'Post Offer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
