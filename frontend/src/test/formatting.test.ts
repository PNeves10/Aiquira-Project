import {
  formatPhoneNumber,
  formatAddress,
  formatName,
  formatTimeZone,
  formatFileSize,
  formatDuration,
} from '../utils/formatting';

describe('Phone Number Formatting', () => {
  it('formats international phone numbers', () => {
    expect(formatPhoneNumber('+1-234-567-8900')).toBe('+1 2345678900');
    expect(formatPhoneNumber('+44-20-7123-4567')).toBe('+44 2071234567');
  });

  it('formats national phone numbers', () => {
    expect(formatPhoneNumber('+1-234-567-8900', 'en', 'national')).toBe('2345678900');
    expect(formatPhoneNumber('+44-20-7123-4567', 'en', 'national')).toBe('2071234567');
  });

  it('formats E.164 phone numbers', () => {
    expect(formatPhoneNumber('+1-234-567-8900', 'en', 'e164')).toBe('+12345678900');
    expect(formatPhoneNumber('+44-20-7123-4567', 'en', 'e164')).toBe('+442071234567');
  });
});

describe('Address Formatting', () => {
  const address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  };

  it('formats addresses in Western style', () => {
    expect(formatAddress(address)).toBe('123 Main St, New York, NY 10001, United States');
  });

  it('formats addresses in Japanese style', () => {
    expect(formatAddress(address, 'ja')).toBe('10001, NY, New York, 123 Main St');
  });

  it('formats addresses in Chinese style', () => {
    expect(formatAddress(address, 'zh')).toBe('United States, NY, New York, 123 Main St, 10001');
  });

  it('formats addresses in Arabic style', () => {
    expect(formatAddress(address, 'ar')).toBe('123 Main St, New York, NY, 10001, United States');
  });

  it('formats addresses in compact style', () => {
    expect(formatAddress(address, 'en', 'compact')).toBe('123 Main St New York NY 10001 United States');
  });

  it('formats addresses in postal style', () => {
    expect(formatAddress(address, 'en', 'postal')).toBe('123 Main St New York NY 10001');
  });
});

describe('Name Formatting', () => {
  const name = {
    prefix: 'Mr.',
    givenName: 'John',
    middleName: 'William',
    familyName: 'Smith',
    suffix: 'Jr.',
  };

  it('formats names in Western style', () => {
    expect(formatName(name)).toBe('Mr. John William Smith Jr.');
  });

  it('formats names in East Asian style', () => {
    expect(formatName(name, 'ja')).toBe('Smith John');
    expect(formatName(name, 'ko')).toBe('Smith John');
    expect(formatName(name, 'zh')).toBe('Smith John');
  });

  it('formats names in Arabic style', () => {
    expect(formatName(name, 'ar')).toBe('John Smith');
  });

  it('formats names in formal style', () => {
    expect(formatName(name, 'en', 'formal')).toBe('Smith');
  });

  it('formats names in informal style', () => {
    expect(formatName(name, 'en', 'informal')).toBe('Mr.');
  });
});

describe('Time Zone Formatting', () => {
  const date = new Date('2024-03-15T10:30:00');

  it('formats time zones in long format', () => {
    expect(formatTimeZone(date, 'en', 'long')).toBe('America/New_York');
  });

  it('formats time zones in short format', () => {
    expect(formatTimeZone(date, 'en', 'short')).toBe('EST');
  });

  it('formats time zones in offset format', () => {
    expect(formatTimeZone(date, 'en', 'offset')).toMatch(/^[+-]\d{2}:\d{2}$/);
  });
});

describe('File Size Formatting', () => {
  it('formats file sizes in binary format', () => {
    expect(formatFileSize(1024)).toBe('1.0 KiB');
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MiB');
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GiB');
  });

  it('formats file sizes in decimal format', () => {
    expect(formatFileSize(1000, 'en', 'decimal')).toBe('1.0 KB');
    expect(formatFileSize(1000 * 1000, 'en', 'decimal')).toBe('1.0 MB');
    expect(formatFileSize(1000 * 1000 * 1000, 'en', 'decimal')).toBe('1.0 GB');
  });

  it('formats file sizes with locale-specific number formatting', () => {
    expect(formatFileSize(1234.56, 'ar')).toBe('١٫٢ KiB');
    expect(formatFileSize(1234.56, 'zh')).toBe('1.2 KiB');
  });
});

describe('Duration Formatting', () => {
  it('formats durations in long format', () => {
    expect(formatDuration(3600000)).toBe('1 hour');
    expect(formatDuration(7200000)).toBe('2 hours');
    expect(formatDuration(90000000)).toBe('1 day, 1 hour');
  });

  it('formats durations in short format', () => {
    expect(formatDuration(3600000, 'en', 'short')).toBe('1 hour');
    expect(formatDuration(90000000, 'en', 'short')).toBe('1 day 1 hour');
  });

  it('formats durations in compact format', () => {
    expect(formatDuration(3600000, 'en', 'compact')).toBe('1 hour');
    expect(formatDuration(90000000, 'en', 'compact')).toBe('1 day');
  });

  it('formats durations with locale-specific unit formatting', () => {
    expect(formatDuration(3600000, 'ar')).toBe('ساعة واحدة');
    expect(formatDuration(7200000, 'ar')).toBe('ساعتان');
    expect(formatDuration(3600000, 'zh')).toBe('1小时');
  });
}); 