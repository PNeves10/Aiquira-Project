import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import GDPRConsentBanner from '../GDPRConsentBanner';
import { captureError } from '../../utils/sentry';

// Mock the Sentry utility
jest.mock('../../utils/sentry', () => ({
  captureError: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('GDPRConsentBanner', () => {
  const renderWithCookies = (component: React.ReactElement) => {
    return render(
      <CookiesProvider>
        {component}
      </CookiesProvider>
    );
  };

  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    jest.clearAllMocks();
  });

  it('shows the banner when no consent cookie exists', () => {
    renderWithCookies(<GDPRConsentBanner />);
    
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();
  });

  it('does not show the banner when consent cookie exists', () => {
    document.cookie = 'gdpr-consent={"necessary":true,"analytics":true,"marketing":true,"functional":true,"performance":true,"social":true,"advertising":true,"thirdParty":true,"preferences":true};path=/';
    
    renderWithCookies(<GDPRConsentBanner />);
    
    expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
    expect(screen.getByText('Update Cookie Preferences')).toBeInTheDocument();
  });

  it('allows accepting all cookies', async () => {
    renderWithCookies(<GDPRConsentBanner />);
    
    fireEvent.click(screen.getByText('Accept All'));
    
    await waitFor(() => {
      expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
      expect(screen.getByText('Update Cookie Preferences')).toBeInTheDocument();
    });

    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('gdpr-consent='));
    
    expect(consentCookie).toBeDefined();
    if (consentCookie) {
      const preferences = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
      expect(preferences).toEqual({
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true,
        performance: true,
        social: true,
        advertising: true,
        thirdParty: true,
        preferences: true,
      });
    }
  });

  it('allows selecting individual cookie preferences', async () => {
    renderWithCookies(<GDPRConsentBanner />);
    
    // Uncheck analytics and marketing
    fireEvent.click(screen.getByLabelText('Analytics Cookies'));
    fireEvent.click(screen.getByLabelText('Marketing Cookies'));
    
    fireEvent.click(screen.getByText('Save Preferences'));
    
    await waitFor(() => {
      expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
      expect(screen.getByText('Update Cookie Preferences')).toBeInTheDocument();
    });

    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('gdpr-consent='));
    
    expect(consentCookie).toBeDefined();
    if (consentCookie) {
      const preferences = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
      expect(preferences).toEqual({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
        performance: false,
        social: false,
        advertising: false,
        thirdParty: false,
        preferences: false,
      });
    }
  });

  it('prevents disabling necessary cookies', () => {
    renderWithCookies(<GDPRConsentBanner />);
    
    const necessaryCheckbox = screen.getByLabelText('Necessary Cookies');
    expect(necessaryCheckbox).toBeDisabled();
    expect(necessaryCheckbox).toBeChecked();
  });

  it('allows updating preferences after initial consent', async () => {
    // Set initial consent
    document.cookie = 'gdpr-consent={"necessary":true,"analytics":true,"marketing":true,"functional":true,"performance":true,"social":true,"advertising":true,"thirdParty":true,"preferences":true};path=/';
    
    renderWithCookies(<GDPRConsentBanner />);
    
    // Click update preferences button
    fireEvent.click(screen.getByText('Update Cookie Preferences'));
    
    // Verify the preferences dialog is shown
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    
    // Update some preferences
    fireEvent.click(screen.getByLabelText('Analytics Cookies'));
    fireEvent.click(screen.getByText('Save Preferences'));
    
    await waitFor(() => {
      expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
      expect(screen.getByText('Update Cookie Preferences')).toBeInTheDocument();
    });

    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('gdpr-consent='));
    
    expect(consentCookie).toBeDefined();
    if (consentCookie) {
      const preferences = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
      expect(preferences.analytics).toBe(false);
    }
  });

  it('handles errors when saving preferences', async () => {
    // Mock document.cookie to throw an error
    const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', {
      get: () => { throw new Error('Cookie error'); },
      set: () => { throw new Error('Cookie error'); },
    });

    renderWithCookies(<GDPRConsentBanner />);
    
    fireEvent.click(screen.getByText('Accept All'));
    
    await waitFor(() => {
      expect(captureError).toHaveBeenCalledWith(
        expect.any(Error),
        { context: 'Error saving GDPR preferences' }
      );
    });

    // Restore original cookie property
    Object.defineProperty(document, 'cookie', originalCookie!);
  });

  it('shows expiry notification when consent is about to expire', () => {
    // Set consent with expiry date 25 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 25);
    
    document.cookie = 'gdpr-consent={"necessary":true,"analytics":true,"marketing":true,"functional":true,"performance":true,"social":true,"advertising":true,"thirdParty":true,"preferences":true};path=/';
    document.cookie = `gdpr-consent-expiry=${expiryDate.toISOString()};path=/`;
    
    renderWithCookies(<GDPRConsentBanner />);
    
    expect(screen.getByText('Your cookie preferences will expire soon.')).toBeInTheDocument();
  });

  it('allows dismissing expiry notification', () => {
    // Set consent with expiry date 25 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 25);
    
    document.cookie = 'gdpr-consent={"necessary":true,"analytics":true,"marketing":true,"functional":true,"performance":true,"social":true,"advertising":true,"thirdParty":true,"preferences":true};path=/';
    document.cookie = `gdpr-consent-expiry=${expiryDate.toISOString()};path=/`;
    
    renderWithCookies(<GDPRConsentBanner />);
    
    fireEvent.click(screen.getByText('Dismiss'));
    
    expect(screen.queryByText('Your cookie preferences will expire soon.')).not.toBeInTheDocument();
  });

  it('updates expiry date when saving new preferences', async () => {
    renderWithCookies(<GDPRConsentBanner />);
    
    fireEvent.click(screen.getByText('Accept All'));
    
    await waitFor(() => {
      const expiryCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('gdpr-consent-expiry='));
      
      expect(expiryCookie).toBeDefined();
      if (expiryCookie) {
        const expiryDate = new Date(decodeURIComponent(expiryCookie.split('=')[1]));
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        // Allow for a small time difference in the test
        expect(Math.abs(expiryDate.getTime() - oneYearFromNow.getTime())).toBeLessThan(1000);
      }
    });
  });

  it('displays all cookie categories with their icons', () => {
    renderWithCookies(<GDPRConsentBanner />);
    
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
    expect(screen.getByText('📢')).toBeInTheDocument();
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });
}); 