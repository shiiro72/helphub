import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { Textarea } from '../atoms/Textarea';
import { ErrorBanner } from '../molecules/ErrorBanner';
import { createClient } from '@/lib/supabase/client';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
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

  const commonCities = [
    "Bucharest (Romania)",
    "Cluj-Napoca (Romania)",
    "Timisoara (Romania)",
    "Iasi (Romania)",
    "Brasov (Romania)",
    "London (UK)",
    "Paris (France)",
    "Berlin (Germany)",
    "Madrid (Spain)",
    "Rome (Italy)",
    "New York (USA)",
    "Los Angeles (USA)",
    "Toronto (Canada)",
    "Sydney (Australia)"
  ];

  const handleCityChange = (val: string) => {
    setCity(val);
    const match = val.match(/^(.+)\s\((.+)\)$/);
    if (match) {
      // We keep the full value in the input for a moment or
      // we can set city to the parsed value but then we might lose country if they type more.
      // Better: if it matches, set both. If it doesn't match, they might be typing a custom city.
      setCity(match[1]);
      setCountry(match[2]);
    }
  };

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
      setError(t('login_to_post'));
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
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto pt-8 md:pt-16"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden mb-8">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {initialData
              ? (isRequest ? t('edit_request') : t('edit_offer'))
              : (isRequest ? t('post_request') : t('post_offer'))
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
            <Label htmlFor="title" required>{t('title')}</Label>
            <Input
              id="title"
              placeholder={isRequest ? t('request_title_placeholder') : t('offer_title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('description')}</Label>
            <Textarea
              id="content"
              placeholder={isRequest ? t('request_desc_placeholder') : t('offer_desc_placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="city" required>{t('city')}</Label>
              <Input
                id="city"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                list="cities-list"
                required
              />
              <datalist id="cities-list">
                {commonCities.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="country" required>{t('country')}</Label>
              <Input
                id="country"
                placeholder="e.g. USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="address" required>{t('address')}</Label>
              <Input
                id="address"
                placeholder="e.g. 123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward">{t('reward')}</Label>
              <Input
                id="reward"
                placeholder="e.g. Coffee, $20"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>
            {isRequest && (
              <div className="space-y-2">
                <Label htmlFor="maxVolunteers">{t('max_volunteers_field')}</Label>
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
              <Label htmlFor="start_datetime" required>{t('start_datetime_label')}</Label>
              <Input
                id="start_datetime"
                type="datetime-local"
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_datetime">{t('end_datetime_label')}</Label>
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
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? t('processing')
                : (initialData
                    ? (isRequest ? t('update_request') : t('update_offer'))
                    : (isRequest ? t('post_request_btn') : t('post_offer_btn')))
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
