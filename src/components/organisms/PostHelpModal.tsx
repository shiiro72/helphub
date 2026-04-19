import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { Textarea } from '../atoms/Textarea';
import { ErrorBanner } from '../molecules/ErrorBanner';
import { createClient } from '@/lib/supabase/client';
import { HelpRequest, HelpOffer } from '@/lib/types';

interface PostHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'request' | 'offer';
  initialData?: HelpRequest | HelpOffer | null;
}

export const PostHelpModal: React.FC<PostHelpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [reward, setReward] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      // Use functional updates to avoid linting issues if they arise,
      // but here we just want to avoid the immediate cascading render warning
      // by ensuring we only set state when values actually change or on open.
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCity(initialData.city || '');
      setCountry(initialData.country || '');
      setAddress(initialData.address || '');
      setReward(initialData.reward_offer || '');
      setStartDatetime(initialData.start_datetime ? initialData.start_datetime.substring(0, 16) : '');
      setEndDatetime(initialData.end_datetime ? initialData.end_datetime.substring(0, 16) : '');
      if ('max_volunteers' in initialData) {
        setMaxVolunteers(initialData.max_volunteers?.toString() || '');
      }
    } else if (!isOpen) {
      // Clear form when closed
      setTitle('');
      setContent('');
      setCity('');
      setCountry('');
      setAddress('');
      setReward('');
      setStartDatetime('');
      setEndDatetime('');
      setMaxVolunteers('');
    }
  }, [initialData, isOpen]);

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
    const payload: Partial<HelpRequest & HelpOffer> = {
      user_id: user.id,
      title,
      content,
      city: city || null,
      country: country || null,
      address: address || null,
      reward_offer: reward || null,
      start_datetime: startDatetime || null,
      end_datetime: endDatetime || null,
    };

    if (isRequest) {
      payload.request_location = city ? `${city}, ${country}` : 'Remote';
      payload.max_volunteers = maxVolunteers ? parseInt(maxVolunteers) : null;
    } else {
      payload.offer_location = city ? `${city}, ${country}` : 'Remote';
    }

    let dbError;
    if (initialData) {
      const { error: updateError } = await supabase
        .from(table)
        .update(payload)
        .eq('id', initialData.id);
      dbError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from(table)
        .insert(payload);
      dbError = insertError;
    }

    if (dbError) {
      setError(dbError.message);
    } else {
      onSuccess();
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setCity('');
      setCountry('');
      setAddress('');
      setReward('');
      setStartDatetime('');
      setEndDatetime('');
      setMaxVolunteers('');
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
            {initialData
              ? (isRequest ? 'Edit Request' : 'Edit Offer')
              : (isRequest ? 'Post a Request' : 'Post an Offer')
            }
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country (Optional)</Label>
              <Input
                id="country"
                placeholder="e.g. USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              placeholder="e.g. 123 Main St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward (Optional)</Label>
              <Input
                id="reward"
                placeholder="e.g. Coffee, $20, Nothing"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>
            {isRequest && (
              <div className="space-y-2">
                <Label htmlFor="maxVolunteers">Max Volunteers (Optional)</Label>
                <Input
                  id="maxVolunteers"
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_datetime">Required From (Start)</Label>
              <Input
                id="start_datetime"
                type="datetime-local"
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_datetime">Required Until (End - Optional)</Label>
              <Input
                id="end_datetime"
                type="datetime-local"
                value={endDatetime}
                onChange={(e) => setEndDatetime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? (initialData ? 'Saving...' : 'Posting...')
                : (initialData
                    ? (isRequest ? 'Update Request' : 'Update Offer')
                    : (isRequest ? 'Post Request' : 'Post Offer'))
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
