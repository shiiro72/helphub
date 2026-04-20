import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  size?: number;
  className?: string;
  isVerified?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  size = 12,
  className = "text-brand-primary",
  isVerified = false
}) => {
  if (!isVerified) return null;

  return (
    <CheckCircle2
      size={size}
      className={className}
      aria-label="Verified user"
    />
  );
};
