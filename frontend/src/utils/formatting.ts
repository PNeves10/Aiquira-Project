import { format, formatDistance, formatRelative, formatDuration, intervalToDuration } from 'date-fns';
import { ar, enUS, es, zhCN } from 'date-fns/locale';

const locales = {
  en: enUS,
  ar: ar,
  es: es,
  zh: zhCN,
};

export function formatDate(date: Date, locale: string = 'en', formatStr: string = 'PPpp'): string {
  return format(date, formatStr, { locale: locales[locale] });
}

export function formatDistanceToNow(date: Date, locale: string = 'en'): string {
  return formatDistance(date, new Date(), { locale: locales[locale] });
}

export function formatRelativeTime(date: Date, locale: string = 'en'): string {
  return formatRelative(date, new Date(), { locale: locales[locale] });
}

export function formatDuration(duration: Duration, locale: string = 'en'): string {
  return formatDuration(duration, { locale: locales[locale] });
}

export function formatTimeRange(start: Date, end: Date, locale: string = 'en'): string {
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, { locale: locales[locale] });
}

export function formatNumber(
  value: number,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercentage(
  value: number,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options,
  });
}

export function formatCurrency(
  value: number,
  locale: string = 'en',
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
    ...options,
  });
}

export function formatCompactNumber(
  value: number,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
    ...options,
  });
}

export function formatRange(
  start: number,
  end: number,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return `${formatNumber(start, locale, options)} - ${formatNumber(end, locale, options)}`;
}

export function formatOrdinal(
  value: number,
  locale: string = 'en'
): string {
  return formatNumber(value, locale, {
    style: 'decimal',
    minimumIntegerDigits: 1,
  });
}

export function formatScientific(
  value: number,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    notation: 'scientific',
    ...options,
  });
}

export function formatEngineering(
  value: number,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    notation: 'engineering',
    ...options,
  });
}

export function formatUnit(
  value: number,
  unit: string,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    style: 'unit',
    unit,
    ...options,
  });
}

export function formatList(
  items: string[],
  locale: string = 'en',
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  return new Intl.ListFormat(locale, { type }).format(items);
}

export function formatPlural(
  count: number,
  singular: string,
  plural: string,
  locale: string = 'en'
): string {
  const pluralRules = new Intl.PluralRules(locale);
  return pluralRules.select(count) === 'one' ? singular : plural;
}

export function formatPhoneNumber(
  phoneNumber: string,
  locale: string = 'en',
  format: 'international' | 'national' | 'e164' = 'international'
): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Get country code if present
  const countryCode = digits.startsWith('1') ? '1' : digits.slice(0, 2);
  
  // Format based on locale and format type
  switch (format) {
    case 'international':
      return `+${countryCode} ${digits.slice(countryCode.length)}`;
    case 'national':
      return digits.slice(countryCode.length);
    case 'e164':
      return `+${digits}`;
    default:
      return phoneNumber;
  }
}

export function formatAddress(
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  },
  locale: string = 'en',
  format: 'full' | 'compact' | 'postal' = 'full'
): string {
  const parts = [];
  
  switch (locale) {
    case 'ja':
      // Japanese format: Postal Code, Prefecture, City, Street
      if (address.postalCode) parts.push(address.postalCode);
      if (address.state) parts.push(address.state);
      if (address.city) parts.push(address.city);
      if (address.street) parts.push(address.street);
      break;
      
    case 'zh':
      // Chinese format: Country, Province, City, Street, Postal Code
      if (address.country) parts.push(address.country);
      if (address.state) parts.push(address.state);
      if (address.city) parts.push(address.city);
      if (address.street) parts.push(address.street);
      if (address.postalCode) parts.push(address.postalCode);
      break;
      
    case 'ar':
      // Arabic format: Street, City, State, Postal Code, Country
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.postalCode) parts.push(address.postalCode);
      if (address.country) parts.push(address.country);
      break;
      
    default:
      // Western format: Street, City, State Postal Code, Country
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state && address.postalCode) {
        parts.push(`${address.state} ${address.postalCode}`);
      } else {
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
      }
      if (address.country) parts.push(address.country);
  }
  
  switch (format) {
    case 'full':
      return parts.join(', ');
    case 'compact':
      return parts.join(' ');
    case 'postal':
      return parts.filter(part => part !== address.country).join(' ');
    default:
      return parts.join(', ');
  }
}

export function formatName(
  name: {
    givenName?: string;
    familyName?: string;
    middleName?: string;
    prefix?: string;
    suffix?: string;
  },
  locale: string = 'en',
  format: 'full' | 'formal' | 'informal' = 'full'
): string {
  const parts = [];
  
  switch (locale) {
    case 'ja':
    case 'ko':
    case 'zh':
      // East Asian format: Family Name Given Name
      if (name.familyName) parts.push(name.familyName);
      if (name.givenName) parts.push(name.givenName);
      break;
      
    case 'ar':
      // Arabic format: Given Name Family Name
      if (name.givenName) parts.push(name.givenName);
      if (name.familyName) parts.push(name.familyName);
      break;
      
    default:
      // Western format: Prefix Given Name Middle Name Family Name Suffix
      if (name.prefix) parts.push(name.prefix);
      if (name.givenName) parts.push(name.givenName);
      if (name.middleName) parts.push(name.middleName);
      if (name.familyName) parts.push(name.familyName);
      if (name.suffix) parts.push(name.suffix);
  }
  
  switch (format) {
    case 'full':
      return parts.join(' ');
    case 'formal':
      return parts.slice(-1).join(' '); // Last name only
    case 'informal':
      return parts[0]; // First name only
    default:
      return parts.join(' ');
  }
}

export function formatTimeZone(
  date: Date,
  locale: string = 'en',
  format: 'long' | 'short' | 'offset' = 'long'
): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  switch (format) {
    case 'long':
      return new Intl.DateTimeFormat(locale, {
        timeZoneName: 'long',
      }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || '';
      
    case 'short':
      return new Intl.DateTimeFormat(locale, {
        timeZoneName: 'short',
      }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || '';
      
    case 'offset':
      const offset = date.getTimezoneOffset();
      const hours = Math.abs(Math.floor(offset / 60));
      const minutes = Math.abs(offset % 60);
      const sign = offset <= 0 ? '+' : '-';
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
    default:
      return timeZone;
  }
}

export function formatFileSize(
  bytes: number,
  locale: string = 'en',
  format: 'binary' | 'decimal' = 'binary'
): string {
  const units = format === 'binary' 
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    : ['B', 'KB', 'MB', 'GB', 'TB'];
    
  const base = format === 'binary' ? 1024 : 1000;
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= base && unitIndex < units.length - 1) {
    size /= base;
    unitIndex++;
  }
  
  return formatNumber(size, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + ' ' + units[unitIndex];
}

export function formatDuration(
  milliseconds: number,
  locale: string = 'en',
  format: 'long' | 'short' | 'compact' = 'long'
): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts = [];
  
  if (days > 0) {
    parts.push(formatUnit(days, 'day', locale));
  }
  if (hours % 24 > 0) {
    parts.push(formatUnit(hours % 24, 'hour', locale));
  }
  if (minutes % 60 > 0) {
    parts.push(formatUnit(minutes % 60, 'minute', locale));
  }
  if (seconds % 60 > 0) {
    parts.push(formatUnit(seconds % 60, 'second', locale));
  }
  
  switch (format) {
    case 'long':
      return formatList(parts, locale, 'conjunction');
    case 'short':
      return parts.join(' ');
    case 'compact':
      return parts[0] || '0s';
    default:
      return formatList(parts, locale, 'conjunction');
  }
} 