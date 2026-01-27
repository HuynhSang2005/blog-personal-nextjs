import type { Locale } from './types';

export type { Locale };

export { i18nConfig, locales, defaultLocale, isLocale } from './config';

export { getDictionary, dictionaries, type Dictionary } from './loader';
