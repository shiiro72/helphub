import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useTranslation } from 'next-i18next';

interface RatingFormProps {
  onSubmit: (rating: number, tags: string[], comment: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PREDEFINED_TAGS = [
  'Helpful',
  'Friendly',
  'Fast Responder',
  'Reliable',
  'Trustworthy',
  'Expert',
];

export const RatingForm: React.FC<RatingFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslation('common');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, selectedTags, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('rate_your_experience')}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                size={32}
                className={`${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-zinc-300 dark:text-zinc-600'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('add_tags')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'bg-transparent text-zinc-600 border-zinc-200 dark:text-zinc-400 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('comment_optional')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full min-h-[100px] p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
          placeholder={t('tell_us_more')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="full"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="full"
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? t('submitting') : t('submit_rating')}
        </Button>
      </div>
    </form>
  );
};
