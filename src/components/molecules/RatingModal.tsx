import React from 'react';
import { RatingForm } from './RatingForm';
import { X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, tags: string[], comment: string) => void;
  userName: string;
  isSubmitting?: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-brand-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-brand-outline-variant">
        <div className="flex items-center justify-between p-4 border-b border-brand-outline-variant bg-brand-surface-container-low">
          <h2 className="text-lg font-bold text-brand-text-main">{t('rate_user')}</h2>
            Rate {userName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <RatingForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
