import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { X, Flag } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isSubmitting?: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isSubmitting,
}) => {
  const t = useTranslations();
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-brand-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-brand-outline-variant">
        <div className="flex items-center justify-between p-6 border-b border-brand-outline-variant">
          <div className="flex items-center gap-2 text-brand-error">
            <Flag size={20} />
            <h2 className="text-xl font-bold">{t('report_user')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-brand-text-main">
              {t('report_user_reason_title')} <strong>{userName}</strong>:
            </p>
            <Textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('report_reason_placeholder')}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-brand-error text-white hover:bg-brand-error/90 border-none"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? t('processing') : t('submit_report')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
