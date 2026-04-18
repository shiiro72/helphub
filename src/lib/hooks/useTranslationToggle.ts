import { useState } from 'react';
import { useRouter } from 'next/router';
import { translateText } from '@/lib/translate';

export const useTranslationToggle = (originalContent: string) => {
  const { locale } = useRouter();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (translatedContent) {
      setTranslatedContent(null);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(originalContent, locale || 'en');
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    displayContent: translatedContent || originalContent,
    isTranslated: !!translatedContent,
    isTranslating,
    handleTranslate,
  };
};
