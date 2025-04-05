import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { captureMessage } from '../utils/sentry';

interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean;
}

const GDPRConsent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    marketing: false,
    necessary: true, // Always true as these are essential cookies
  });

  useEffect(() => {
    // Check if consent has been given before
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      analytics: true,
      marketing: true,
      necessary: true,
    };
    setPreferences(newPreferences);
    saveConsent(newPreferences);
    setIsOpen(false);
    captureMessage('GDPR consent given - all accepted');
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
    setIsOpen(false);
    captureMessage('GDPR consent given - selected preferences');
  };

  const saveConsent = (prefs: ConsentPreferences) => {
    localStorage.setItem('gdpr-consent', JSON.stringify(prefs));
    localStorage.setItem('gdpr-consent-date', new Date().toISOString());
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-lg mx-4">
          <Dialog.Title className="text-lg font-medium mb-4">
            Cookie Consent
          </Dialog.Title>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience and analyze our traffic.
              Please select your preferences below.
            </p>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Necessary Cookies (Required)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Analytics Cookies</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Marketing Cookies</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Accept Selected
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default GDPRConsent; 