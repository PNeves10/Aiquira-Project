import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { captureError } from '../utils/sentry';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  performance: boolean;
  social: boolean;
  advertising: boolean;
  thirdParty: boolean;
  preferences: boolean;
}

interface CookieCategory {
  id: keyof ConsentPreferences;
  name: string;
  description: string;
  required: boolean;
  icon: string;
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Necessary Cookies',
    description: 'Essential cookies that enable basic functionality and security features. These cannot be disabled.',
    required: true,
    icon: '🔒',
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    required: false,
    icon: '📊',
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to track visitors across websites to display relevant and engaging advertisements.',
    required: false,
    icon: '🎯',
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization, such as remembering your preferences.',
    required: false,
    icon: '⚙️',
  },
  {
    id: 'performance',
    name: 'Performance Cookies',
    description: 'Help us understand and improve how our website performs, including page load times and error rates.',
    required: false,
    icon: '⚡',
  },
  {
    id: 'social',
    name: 'Social Media Cookies',
    description: 'Set by social media services to enable sharing content on social networks.',
    required: false,
    icon: '👥',
  },
  {
    id: 'advertising',
    name: 'Advertising Cookies',
    description: 'Used to deliver personalized advertisements and measure their effectiveness.',
    required: false,
    icon: '📢',
  },
  {
    id: 'thirdParty',
    name: 'Third-Party Cookies',
    description: 'Set by external services we use to enhance our website functionality.',
    required: false,
    icon: '🌐',
  },
  {
    id: 'preferences',
    name: 'Preference Cookies',
    description: 'Remember your settings and choices to provide a better browsing experience.',
    required: false,
    icon: '⚙️',
  },
];

const GDPRConsentBanner: React.FC = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['gdpr-consent', 'gdpr-consent-expiry']);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showExpiryNotification, setShowExpiryNotification] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
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

  useEffect(() => {
    const consent = cookies['gdpr-consent'];
    const expiry = cookies['gdpr-consent-expiry'];
    
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        
        // Check if consent is about to expire (within 30 days)
        if (expiry) {
          const expiryDate = new Date(expiry);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          
          if (expiryDate < thirtyDaysFromNow) {
            setShowExpiryNotification(true);
          }
        }
      } catch (error) {
        captureError(error as Error, { context: 'Error parsing saved preferences' });
      }
    }
  }, [cookies]);

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      performance: true,
      social: true,
      advertising: true,
      thirdParty: true,
      preferences: true,
    };
    savePreferences(newPreferences);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };

  const handleUpdatePreferences = () => {
    setShowPreferences(true);
  };

  const handleDismissExpiryNotification = () => {
    setShowExpiryNotification(false);
  };

  const savePreferences = (prefs: ConsentPreferences) => {
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      setCookie('gdpr-consent', JSON.stringify(prefs), {
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      setCookie('gdpr-consent-expiry', expiryDate.toISOString(), {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      setShowBanner(false);
      setShowPreferences(false);
      setShowExpiryNotification(false);
    } catch (error) {
      captureError(error as Error, { context: 'Error saving GDPR preferences' });
    }
  };

  const renderConsentContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto"
    >
      <h2 id="gdpr-consent-title" className="text-lg font-semibold mb-4">
        Cookie Preferences
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        We use cookies to enhance your browsing experience and analyze site traffic.
        Please select your preferences below.
      </p>
      
      <div className="space-y-4 mb-6">
        {cookieCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences[category.id]}
                    onChange={(e) =>
                      setPreferences({ ...preferences, [category.id]: e.target.checked })
                    }
                    disabled={category.required}
                    className="rounded border-gray-300"
                  />
                  <span className="font-medium flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </span>
                </label>
                <p className="mt-1 text-sm text-gray-500">{category.description}</p>
              </div>
              {category.required && (
                <span className="text-xs text-blue-600 font-medium">Required</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAcceptSelected}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Preferences
        </motion.button>
        {!showPreferences && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Accept All
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {showExpiryNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-lg max-w-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your cookie preferences will expire soon. Would you like to review and update them?
                </p>
                <div className="mt-2 flex space-x-3">
                  <button
                    onClick={handleUpdatePreferences}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Update Preferences
                  </button>
                  <button
                    onClick={handleDismissExpiryNotification}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showBanner && !showPreferences && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUpdatePreferences}
          className="fixed bottom-4 right-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update Cookie Preferences
        </motion.button>
      )}

      <AnimatePresence>
        {(showBanner || showPreferences) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {renderConsentContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GDPRConsentBanner; 