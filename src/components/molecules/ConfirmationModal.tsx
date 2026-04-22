import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-brand-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-brand-outline-variant">
        <div className="flex items-center justify-between p-6 border-b border-brand-outline-variant">
          <div className="flex items-center gap-2">
            {variant === 'danger' && <AlertTriangle className="text-brand-error" size={20} />}
            <h2 className="text-xl font-bold text-brand-text-main">{title}</h2>
          </div>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-main">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-brand-text-secondary">
            {message}
          </div>

          <div className="flex gap-3 pt-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              className={`flex-1 ${variant === 'danger' ? 'bg-brand-error hover:opacity-90 text-brand-on-error' : ''}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
