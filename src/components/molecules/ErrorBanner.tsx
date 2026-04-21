import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start gap-3 ${className}`}
      role="alert"
    >
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div className="grow">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
          aria-label="Dismiss error"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
