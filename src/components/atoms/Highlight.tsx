import React from 'react';

interface HighlightProps {
  text: string;
  query: string;
}

export const Highlight: React.FC<HighlightProps> = ({ text, query }) => {
  if (!query.trim()) {
    return <>{text}</>;
  }

  if (!text) return null;

  // Escape special characters for regex
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-800/50 text-inherit px-0.5 rounded-sm"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};
