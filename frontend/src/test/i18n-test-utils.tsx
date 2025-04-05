import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

export function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      {ui}
    </I18nextProvider>
  );
}

export async function changeLanguage(language: string) {
  await i18n.changeLanguage(language);
  document.documentElement.lang = language;
  document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(language) ? 'rtl' : 'ltr';
}

export function expectTranslation(key: string, expectedText: string) {
  expect(screen.getByText(expectedText)).toBeInTheDocument();
}

export async function expectTranslationAsync(key: string, expectedText: string) {
  await waitFor(() => {
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
}

export function expectNoTranslation(key: string, text: string) {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
}

export function expectRTLDirection() {
  expect(document.documentElement.dir).toBe('rtl');
}

export function expectLTRDirection() {
  expect(document.documentElement.dir).toBe('ltr');
}

export function expectLanguage(language: string) {
  expect(document.documentElement.lang).toBe(language);
}

export function expectFormattedNumber(value: number, expected: string) {
  expect(screen.getByText(expected)).toBeInTheDocument();
}

export function expectFormattedDate(date: Date, expected: string) {
  expect(screen.getByText(expected)).toBeInTheDocument();
}

export function expectFormattedCurrency(value: number, expected: string) {
  expect(screen.getByText(expected)).toBeInTheDocument();
}

export function expectFormattedPercentage(value: number, expected: string) {
  expect(screen.getByText(expected)).toBeInTheDocument();
}

export function expectFormattedList(items: string[], expected: string) {
  expect(screen.getByText(expected)).toBeInTheDocument();
}

export function expectFormattedPlural(count: number, singular: string, plural: string, expected: string) {
  expect(screen.getByText(expected)).toBeInTheDocument();
}

export function expectRTLComponent(component: HTMLElement) {
  expect(component).toHaveAttribute('dir', 'rtl');
}

export function expectLTRComponent(component: HTMLElement) {
  expect(component).toHaveAttribute('dir', 'ltr');
}

export function expectRTLStyle(component: HTMLElement) {
  expect(component).toHaveStyle({ direction: 'rtl' });
}

export function expectLTRStyle(component: HTMLElement) {
  expect(component).toHaveStyle({ direction: 'ltr' });
}

export function expectRTLFlexDirection(component: HTMLElement) {
  expect(component).toHaveStyle({ flexDirection: 'row-reverse' });
}

export function expectLTRFlexDirection(component: HTMLElement) {
  expect(component).toHaveStyle({ flexDirection: 'row' });
}

export function expectRTLGridDirection(component: HTMLElement) {
  expect(component).toHaveStyle({ direction: 'rtl' });
}

export function expectLTRGridDirection(component: HTMLElement) {
  expect(component).toHaveStyle({ direction: 'ltr' });
}

export function expectRTLTextAlignment(component: HTMLElement) {
  expect(component).toHaveStyle({ textAlign: 'right' });
}

export function expectLTRTextAlignment(component: HTMLElement) {
  expect(component).toHaveStyle({ textAlign: 'left' });
}

export function expectRTLMargin(component: HTMLElement) {
  expect(component).toHaveStyle({
    marginRight: '0px',
    marginLeft: '1rem',
  });
}

export function expectLTRMargin(component: HTMLElement) {
  expect(component).toHaveStyle({
    marginLeft: '0px',
    marginRight: '1rem',
  });
}

export function expectRTLPadding(component: HTMLElement) {
  expect(component).toHaveStyle({
    paddingRight: '0px',
    paddingLeft: '1rem',
  });
}

export function expectLTRPadding(component: HTMLElement) {
  expect(component).toHaveStyle({
    paddingLeft: '0px',
    paddingRight: '1rem',
  });
} 