import type { Locale } from './types';

export type { Locale };

export const i18nConfig = {
  locales: ['en', 'vi'] as const,
  defaultLocale: 'en' as const,
} as const;

export const locales = i18nConfig.locales;
export const defaultLocale = i18nConfig.defaultLocale;

export function isLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}
