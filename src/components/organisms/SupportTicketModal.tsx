import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function SupportTicketModal({ isOpen, onClose, userId }: SupportTicketModalProps) {
  const t = useTranslations();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('support_tickets').insert({
      user_id: userId,
      subject,
      message,
    });

    setIsSubmitting(false);

    if (error) {
      setError(t('ticket_sent_error'));
    } else {
      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-brand-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-brand-outline-variant">
        <div className="flex items-center justify-between p-4 border-b border-brand-outline-variant">
          <h2 className="text-lg font-bold text-brand-text-main">
            {t('send_ticket')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {success ? (
            <div className="p-4 bg-brand-success/10 border border-brand-success text-brand-success rounded-md text-center">
              {t('ticket_sent_success')}
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-text-main">
                  {t('subject')}
                </label>
                <Input
                  required
                  value={subject}
                  autoComplete="off"
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('ticket_subject_placeholder')}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-text-main">
                  {t('message_label')}
                </label>
                <Textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('ticket_message_placeholder')}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? t('processing') : t('send_ticket')}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
