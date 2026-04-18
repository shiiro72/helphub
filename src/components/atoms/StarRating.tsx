import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalRatings = 0,
  size = 16,
  showCount = false,
  className = '',
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-zinc-300 dark:text-zinc-600" />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
          ({totalRatings})
        </span>
      )}
    </div>
  );
};
