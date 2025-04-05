import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIAnalysis } from '../AIAnalysis';
import {
  renderWithI18n,
  changeLanguage,
  expectTranslation,
  expectTranslationAsync,
  expectNoTranslation,
  expectRTLDirection,
  expectLTRDirection,
  expectLanguage,
  expectFormattedNumber,
  expectFormattedDate,
  expectFormattedCurrency,
  expectFormattedPercentage,
  expectRTLComponent,
  expectLTRComponent,
  expectRTLStyle,
  expectLTRStyle,
  expectRTLTextAlignment,
  expectLTRTextAlignment,
} from '../../test/i18n-test-utils';

const mockAnalysis = {
  riskScore: 75,
  marketInsights: {
    trend: 'positive',
    confidence: 0.85,
    factors: ['Market Growth', 'Competition'],
  },
  issues: [
    {
      severity: 'high',
      description: 'Environmental Impact',
      impact: 'High',
      resolution: 'Implement Green Practices',
    },
  ],
  recommendations: [
    'Invest in Sustainable Technology',
    'Diversify Market Presence',
  ],
};

describe('AIAnalysis i18n', () => {
  beforeEach(() => {
    // Reset language to English before each test
    changeLanguage('en');
  });

  describe('Language Support', () => {
    it('renders in English', () => {
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectTranslation('analysis.riskScore.title', 'Risk Score');
      expectTranslation('analysis.marketInsights.title', 'Market Insights');
      expectTranslation('analysis.issues.title', 'Identified Issues');
    });

    it('renders in Arabic', async () => {
      await changeLanguage('ar');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      await expectTranslationAsync('analysis.riskScore.title', 'درجة المخاطر');
      await expectTranslationAsync('analysis.marketInsights.title', 'رؤى السوق');
      await expectTranslationAsync('analysis.issues.title', 'المشكلات المحددة');
    });

    it('renders in Spanish', async () => {
      await changeLanguage('es');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      await expectTranslationAsync('analysis.riskScore.title', 'Puntuación de Riesgo');
      await expectTranslationAsync('analysis.marketInsights.title', 'Perspectivas del Mercado');
      await expectTranslationAsync('analysis.issues.title', 'Problemas Identificados');
    });

    it('renders in Chinese', async () => {
      await changeLanguage('zh');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      await expectTranslationAsync('analysis.riskScore.title', '风险评分');
      await expectTranslationAsync('analysis.marketInsights.title', '市场洞察');
      await expectTranslationAsync('analysis.issues.title', '已识别问题');
    });
  });

  describe('RTL Support', () => {
    it('applies RTL layout for Arabic', async () => {
      await changeLanguage('ar');
      const { container } = renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectRTLDirection();
      expectLanguage('ar');
      expectRTLComponent(container.firstChild as HTMLElement);
      expectRTLStyle(container.firstChild as HTMLElement);
    });

    it('applies LTR layout for English', () => {
      const { container } = renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectLTRDirection();
      expectLanguage('en');
      expectLTRComponent(container.firstChild as HTMLElement);
      expectLTRStyle(container.firstChild as HTMLElement);
    });

    it('handles text alignment correctly in RTL', async () => {
      await changeLanguage('ar');
      const { container } = renderWithI18n(<AIAnalysis assetId="test-123" />);
      const marketInsights = container.querySelector('.market-insights');
      expectRTLTextAlignment(marketInsights as HTMLElement);
    });

    it('handles text alignment correctly in LTR', () => {
      const { container } = renderWithI18n(<AIAnalysis assetId="test-123" />);
      const marketInsights = container.querySelector('.market-insights');
      expectLTRTextAlignment(marketInsights as HTMLElement);
    });
  });

  describe('Number Formatting', () => {
    it('formats risk score percentage correctly in English', () => {
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedPercentage(0.75, '75.0%');
    });

    it('formats risk score percentage correctly in Arabic', async () => {
      await changeLanguage('ar');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedPercentage(0.75, '٧٥٫٠٪');
    });

    it('formats risk score percentage correctly in Spanish', async () => {
      await changeLanguage('es');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedPercentage(0.75, '75,0%');
    });

    it('formats risk score percentage correctly in Chinese', async () => {
      await changeLanguage('zh');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedPercentage(0.75, '75.0%');
    });
  });

  describe('Date Formatting', () => {
    const testDate = new Date('2024-03-15T10:30:00');

    it('formats date correctly in English', () => {
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedDate(testDate, 'Mar 15, 2024, 10:30 AM');
    });

    it('formats date correctly in Arabic', async () => {
      await changeLanguage('ar');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedDate(testDate, '١٥ مارس ٢٠٢٤، ١٠:٣٠ ص');
    });

    it('formats date correctly in Spanish', async () => {
      await changeLanguage('es');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedDate(testDate, '15 mar 2024, 10:30');
    });

    it('formats date correctly in Chinese', async () => {
      await changeLanguage('zh');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedDate(testDate, '2024年3月15日 10:30');
    });
  });

  describe('Currency Formatting', () => {
    const testAmount = 1234.56;

    it('formats currency correctly in English', () => {
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedCurrency(testAmount, '$1,234.56');
    });

    it('formats currency correctly in Arabic', async () => {
      await changeLanguage('ar');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedCurrency(testAmount, '١٬٢٣٤٫٥٦ $');
    });

    it('formats currency correctly in Spanish', async () => {
      await changeLanguage('es');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedCurrency(testAmount, '1.234,56 €');
    });

    it('formats currency correctly in Chinese', async () => {
      await changeLanguage('zh');
      renderWithI18n(<AIAnalysis assetId="test-123" />);
      expectFormattedCurrency(testAmount, '¥1,234.56');
    });
  });

  describe('Error Handling', () => {
    it('shows error message in English', () => {
      renderWithI18n(<AIAnalysis assetId="error-123" />);
      expectTranslation('common.error', 'Error loading analysis');
    });

    it('shows error message in Arabic', async () => {
      await changeLanguage('ar');
      renderWithI18n(<AIAnalysis assetId="error-123" />);
      await expectTranslationAsync('common.error', 'خطأ في تحميل التحليل');
    });

    it('shows error message in Spanish', async () => {
      await changeLanguage('es');
      renderWithI18n(<AIAnalysis assetId="error-123" />);
      await expectTranslationAsync('common.error', 'Error al cargar el análisis');
    });

    it('shows error message in Chinese', async () => {
      await changeLanguage('zh');
      renderWithI18n(<AIAnalysis assetId="error-123" />);
      await expectTranslationAsync('common.error', '加载分析时出错');
    });
  });

  describe('Loading State', () => {
    it('shows loading message in English', () => {
      renderWithI18n(<AIAnalysis assetId="loading-123" />);
      expectTranslation('common.loading', 'Loading analysis...');
    });

    it('shows loading message in Arabic', async () => {
      await changeLanguage('ar');
      renderWithI18n(<AIAnalysis assetId="loading-123" />);
      await expectTranslationAsync('common.loading', 'جاري تحميل التحليل...');
    });

    it('shows loading message in Spanish', async () => {
      await changeLanguage('es');
      renderWithI18n(<AIAnalysis assetId="loading-123" />);
      await expectTranslationAsync('common.loading', 'Cargando análisis...');
    });

    it('shows loading message in Chinese', async () => {
      await changeLanguage('zh');
      renderWithI18n(<AIAnalysis assetId="loading-123" />);
      await expectTranslationAsync('common.loading', '正在加载分析...');
    });
  });
}); 