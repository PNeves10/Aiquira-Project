import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function useDirection(): 'ltr' | 'rtl' {
  const { i18n } = useTranslation();
  
  return RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr';
} 