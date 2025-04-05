import React from 'react';
import { useTranslation } from 'react-i18next';
import { RTLContainer } from './RTLContainer';

interface Language {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
  flag?: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'he', name: 'עברית', dir: 'rtl', flag: '🇮🇱' },
  { code: 'fa', name: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
  { code: 'ur', name: 'اردو', dir: 'rtl', flag: '🇵🇰' },
];

interface LanguageSelectorProps {
  className?: string;
  showFlags?: boolean;
  showNames?: boolean;
}

export function LanguageSelector({
  className = '',
  showFlags = true,
  showNames = true,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = async (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      await i18n.changeLanguage(languageCode);
      document.documentElement.dir = language.dir;
      document.documentElement.lang = languageCode;
    }
  };
  
  return (
    <RTLContainer className={`language-selector ${className}`}>
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="language-select"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {showFlags && lang.flag} {showNames && lang.name}
          </option>
        ))}
      </select>
    </RTLContainer>
  );
} 