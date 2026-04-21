import React from 'react';
import { Languages } from 'lucide-react';
import { useRouter } from 'next/router';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  onLanguageChange?: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'desktop',
  onLanguageChange
}) => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push({ pathname, query }, asPath, { locale: e.target.value });
    if (onLanguageChange) onLanguageChange();
  };

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2 px-2 py-2 border-t border-brand-border">
        <Languages size={18} className="text-brand-text-secondary" />
        <select
          value={locale}
          onChange={handleChange}
          className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-brand-text-main"
        >
          <option value="en">English</option>
          <option value="ro">Română</option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mr-2">
      <Languages size={18} className="text-brand-text-secondary" />
      <select
        value={locale}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-brand-text-main"
      >
        <option value="en">EN</option>
        <option value="ro">RO</option>
      </select>
    </div>
  );
};
