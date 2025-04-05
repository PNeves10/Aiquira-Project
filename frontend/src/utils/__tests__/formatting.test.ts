import {
  formatPhoneNumber,
  formatAddress,
  formatName,
  formatTimeZone,
  formatFileSize,
  formatDuration,
} from '../formatting';

describe('formatPhoneNumber', () => {
  const testNumber = '+1234567890';

  it('formats international format', () => {
    expect(formatPhoneNumber(testNumber, 'en-US', 'international')).toBe('+1 (234) 567-890');
  });

  it('formats national format', () => {
    expect(formatPhoneNumber(testNumber, 'en-US', 'national')).toBe('(234) 567-890');
  });

  it('formats E.164 format', () => {
    expect(formatPhoneNumber(testNumber, 'en-US', 'e164')).toBe('+1234567890');
  });

  it('handles different locales', () => {
    expect(formatPhoneNumber(testNumber, 'ja-JP', 'international')).toBe('+1 234-567-890');
    expect(formatPhoneNumber(testNumber, 'ar-SA', 'international')).toBe('+١ ٢٣٤ ٥٦٧ ٨٩٠');
  });

  it('handles invalid input', () => {
    expect(formatPhoneNumber('invalid', 'en-US', 'international')).toBe('invalid');
  });
});

describe('formatAddress', () => {
  const testAddress = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  };

  it('formats Western address', () => {
    expect(formatAddress(testAddress, 'en-US', 'full')).toBe('123 Main St, New York, NY 10001, US');
  });

  it('formats Japanese address', () => {
    expect(formatAddress(testAddress, 'ja-JP', 'full')).toBe('US 10001 NY New York 123 Main St');
  });

  it('formats Chinese address', () => {
    expect(formatAddress(testAddress, 'zh-CN', 'full')).toBe('US 10001 NY New York 123 Main St');
  });

  it('formats Arabic address', () => {
    expect(formatAddress(testAddress, 'ar-SA', 'full')).toBe('US ١٠٠٠١ NY New York ١٢٣ Main St');
  });

  it('formats compact style', () => {
    expect(formatAddress(testAddress, 'en-US', 'compact')).toBe('123 Main St, New York, NY');
  });

  it('formats postal style', () => {
    expect(formatAddress(testAddress, 'en-US', 'postal')).toBe('123 Main St\nNew York, NY 10001\nUS');
  });
});

describe('formatName', () => {
  const testName = {
    givenName: 'John',
    familyName: 'Doe',
    middleName: 'Robert',
    prefix: 'Mr',
    suffix: 'Jr',
  };

  it('formats Western name', () => {
    expect(formatName(testName, 'en-US', 'full')).toBe('Mr John Robert Doe Jr');
  });

  it('formats East Asian name', () => {
    expect(formatName(testName, 'ja-JP', 'full')).toBe('Doe John Robert');
  });

  it('formats Arabic name', () => {
    expect(formatName(testName, 'ar-SA', 'full')).toBe('Mr جون روبرت Doe Jr');
  });

  it('formats formal style', () => {
    expect(formatName(testName, 'en-US', 'formal')).toBe('Mr Doe');
  });

  it('formats informal style', () => {
    expect(formatName(testName, 'en-US', 'informal')).toBe('John');
  });
});

describe('formatTimeZone', () => {
  const testDate = new Date('2024-01-01T12:00:00Z');

  it('formats long format', () => {
    expect(formatTimeZone(testDate, 'en-US', 'long')).toMatch(/America\/New_York/);
  });

  it('formats short format', () => {
    expect(formatTimeZone(testDate, 'en-US', 'short')).toMatch(/EST/);
  });

  it('formats offset format', () => {
    expect(formatTimeZone(testDate, 'en-US', 'offset')).toMatch(/GMT-5/);
  });

  it('handles different locales', () => {
    expect(formatTimeZone(testDate, 'ja-JP', 'long')).toMatch(/アメリカ\/ニューヨーク/);
    expect(formatTimeZone(testDate, 'ar-SA', 'long')).toMatch(/أمريكا\/نيويورك/);
  });
});

describe('formatFileSize', () => {
  it('formats binary format', () => {
    expect(formatFileSize(1024, 'en-US', 'binary')).toBe('1 KB');
    expect(formatFileSize(1024 * 1024, 'en-US', 'binary')).toBe('1 MB');
    expect(formatFileSize(1024 * 1024 * 1024, 'en-US', 'binary')).toBe('1 GB');
  });

  it('formats decimal format', () => {
    expect(formatFileSize(1000, 'en-US', 'decimal')).toBe('1 KB');
    expect(formatFileSize(1000 * 1000, 'en-US', 'decimal')).toBe('1 MB');
    expect(formatFileSize(1000 * 1000 * 1000, 'en-US', 'decimal')).toBe('1 GB');
  });

  it('handles different locales', () => {
    expect(formatFileSize(1024, 'ja-JP', 'binary')).toBe('1 KB');
    expect(formatFileSize(1024, 'ar-SA', 'binary')).toBe('١ KB');
  });

  it('handles zero and small sizes', () => {
    expect(formatFileSize(0, 'en-US', 'binary')).toBe('0 B');
    expect(formatFileSize(500, 'en-US', 'binary')).toBe('500 B');
  });
});

describe('formatDuration', () => {
  const testDuration = 3661; // 1 hour, 1 minute, 1 second

  it('formats long format', () => {
    expect(formatDuration(testDuration, 'en-US', 'long')).toBe('1 hour, 1 minute, 1 second');
  });

  it('formats short format', () => {
    expect(formatDuration(testDuration, 'en-US', 'short')).toBe('1h 1m 1s');
  });

  it('formats compact format', () => {
    expect(formatDuration(testDuration, 'en-US', 'compact')).toBe('1:01:01');
  });

  it('handles different locales', () => {
    expect(formatDuration(testDuration, 'ja-JP', 'long')).toBe('1時間1分1秒');
    expect(formatDuration(testDuration, 'ar-SA', 'long')).toBe('١ ساعة، ١ دقيقة، ١ ثانية');
  });

  it('handles zero and small durations', () => {
    expect(formatDuration(0, 'en-US', 'long')).toBe('0 seconds');
    expect(formatDuration(30, 'en-US', 'long')).toBe('30 seconds');
  });
}); 