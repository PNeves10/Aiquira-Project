# AI Analysis Component Internationalization Guide

## Overview
This guide covers the implementation of internationalization (i18n), right-to-left (RTL) support, and locale-specific formatting for the AI Analysis component.

## Implementation

### 1. i18n Setup

#### Install Dependencies
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

#### Create Translation Files
```typescript
// src/i18n/locales/en.json
{
  "analysis": {
    "riskScore": {
      "title": "Risk Score",
      "low": "Low Risk",
      "medium": "Medium Risk",
      "high": "High Risk"
    },
    "marketInsights": {
      "title": "Market Insights",
      "trend": {
        "positive": "Positive",
        "neutral": "Neutral",
        "negative": "Negative"
      },
      "confidence": "Confidence Level",
      "factors": "Key Factors"
    },
    "issues": {
      "title": "Identified Issues",
      "severity": {
        "high": "High",
        "medium": "Medium",
        "low": "Low"
      },
      "impact": "Impact",
      "resolution": "Recommended Resolution"
    },
    "recommendations": {
      "title": "Recommendations"
    }
  },
  "common": {
    "loading": "Loading analysis...",
    "error": "Error loading analysis",
    "retry": "Retry",
    "refresh": "Refresh"
  }
}

// src/i18n/locales/ar.json
{
  "analysis": {
    "riskScore": {
      "title": "درجة المخاطر",
      "low": "مخاطر منخفضة",
      "medium": "مخاطر متوسطة",
      "high": "مخاطر عالية"
    },
    "marketInsights": {
      "title": "رؤى السوق",
      "trend": {
        "positive": "إيجابي",
        "neutral": "محايد",
        "negative": "سلبي"
      },
      "confidence": "مستوى الثقة",
      "factors": "العوامل الرئيسية"
    },
    "issues": {
      "title": "المشكلات المحددة",
      "severity": {
        "high": "عالية",
        "medium": "متوسطة",
        "low": "منخفضة"
      },
      "impact": "التأثير",
      "resolution": "الحل الموصى به"
    },
    "recommendations": {
      "title": "التوصيات"
    }
  },
  "common": {
    "loading": "جاري تحميل التحليل...",
    "error": "خطأ في تحميل التحليل",
    "retry": "إعادة المحاولة",
    "refresh": "تحديث"
  }
}
```

#### Configure i18n
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 2. RTL Support

#### Add RTL Styles
```typescript
// src/styles/rtl.css
[dir="rtl"] {
  .analysis-container {
    direction: rtl;
  }

  .risk-score {
    transform: scaleX(-1);
  }

  .market-insights {
    text-align: right;
  }

  .issues-list {
    padding-right: 0;
    padding-left: 1rem;
  }
}
```

#### Implement RTL Layout
```typescript
// src/components/AIAnalysis.tsx
import { useTranslation } from 'react-i18next';
import { useDirection } from './hooks/useDirection';

function AIAnalysis({ assetId }: { assetId: string }) {
  const { t } = useTranslation();
  const direction = useDirection();
  
  return (
    <div dir={direction} className="analysis-container">
      <div className="risk-score-section">
        <h2>{t('analysis.riskScore.title')}</h2>
        <RiskScore value={analysis.riskScore} />
      </div>
      
      <div className="market-insights-section">
        <h2>{t('analysis.marketInsights.title')}</h2>
        <MarketInsights data={analysis.marketInsights} />
      </div>
      
      <div className="issues-section">
        <h2>{t('analysis.issues.title')}</h2>
        <IssuesList issues={analysis.issues} />
      </div>
    </div>
  );
}
```

### 3. Locale-Specific Formatting

#### Create Formatting Utilities
```typescript
// src/utils/formatting.ts
import { format, formatDistance } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const locales = {
  en: enUS,
  ar: ar,
};

export function formatDate(date: Date, locale: string = 'en'): string {
  return format(date, 'PPpp', { locale: locales[locale] });
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
  locale: string = 'en'
): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatCurrency(
  value: number,
  locale: string = 'en',
  currency: string = 'USD'
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
  });
}
```

#### Implement Formatted Components
```typescript
// src/components/RiskScore.tsx
import { useTranslation } from 'react-i18next';
import { formatPercentage } from '../utils/formatting';

function RiskScore({ value }: { value: number }) {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="risk-score">
      <div className="score-value">
        {formatPercentage(value / 100, i18n.language)}
      </div>
      <div className="risk-level">
        {t(`analysis.riskScore.${getRiskLevel(value)}`)}
      </div>
    </div>
  );
}

// src/components/MarketInsights.tsx
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatting';

function MarketInsights({ data }: { data: MarketInsightsData }) {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="market-insights">
      <div className="trend">
        {t(`analysis.marketInsights.trend.${data.trend}`)}
      </div>
      <div className="confidence">
        {formatPercentage(data.confidence, i18n.language)}
      </div>
      <div className="last-updated">
        {formatDate(new Date(), i18n.language)}
      </div>
    </div>
  );
}
```

### 4. Language Switching

#### Create Language Selector
```typescript
// src/components/LanguageSelector.tsx
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

function LanguageSelector() {
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
    <select
      value={i18n.language}
      onChange={(e) => handleLanguageChange(e.target.value)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 5. RTL-Aware Components

#### Create RTL-Aware Layout Components
```typescript
// src/components/RTLContainer.tsx
import { useDirection } from '../hooks/useDirection';

interface RTLContainerProps {
  children: React.ReactNode;
  className?: string;
}

function RTLContainer({ children, className = '' }: RTLContainerProps) {
  const direction = useDirection();
  
  return (
    <div dir={direction} className={`rtl-container ${className}`}>
      {children}
    </div>
  );
}

// src/components/RTLFlex.tsx
function RTLFlex({ children, className = '' }: RTLContainerProps) {
  const direction = useDirection();
  
  return (
    <div
      dir={direction}
      className={`rtl-flex ${className}`}
      style={{
        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      }}
    >
      {children}
    </div>
  );
}
```

### 6. Testing

#### Add i18n Test Utilities
```typescript
// src/test/i18n-test-utils.tsx
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

export function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      {ui}
    </I18nextProvider>
  );
}

// src/components/__tests__/AIAnalysis.i18n.test.tsx
import { renderWithI18n } from '../../test/i18n-test-utils';

describe('AIAnalysis i18n', () => {
  it('renders in English', () => {
    const { getByText } = renderWithI18n(
      <AIAnalysis assetId="test-123" />
    );
    expect(getByText('Risk Score')).toBeInTheDocument();
  });

  it('renders in Arabic', async () => {
    await i18n.changeLanguage('ar');
    const { getByText } = renderWithI18n(
      <AIAnalysis assetId="test-123" />
    );
    expect(getByText('درجة المخاطر')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Translation Management
- Use translation keys that are descriptive and hierarchical
- Keep translations in separate files for each language
- Use translation interpolation for dynamic values
- Implement fallback translations

### 2. RTL Support
- Use logical properties (start/end) instead of left/right
- Test layouts in both LTR and RTL modes
- Handle bidirectional text properly
- Consider using CSS logical properties

### 3. Date and Number Formatting
- Use locale-specific formatting for all dates and numbers
- Consider timezone differences
- Handle different calendar systems
- Use appropriate number formats for each locale

### 4. Performance
- Lazy load translation files
- Cache formatted values when possible
- Minimize re-renders when switching languages
- Use memoization for expensive formatting operations

## Support Resources

### Documentation
- [i18next Documentation](https://www.i18next.com/)
- [RTL Styling Guide](./rtl-styling.md)
- [Locale Formatting Guide](./locale-formatting.md)

### Tools
- [Translation Manager](./tools/translation-manager.ts)
- [RTL Layout Helper](./tools/rtl-helper.ts)
- [Formatting Utilities](./tools/formatting.ts)

### Community
- [i18next GitHub](https://github.com/i18next/i18next)
- [RTL Support Forum](https://forum.rtlstyling.com)
- [Localization Best Practices](https://localization-guide.readthedocs.io) 