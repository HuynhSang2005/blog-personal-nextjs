import 'server-only';

import type { Locale } from './types';
import { i18nConfig } from './config';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  vi: () => import('./dictionaries/vi.json').then((module) => module.default),
};

export { dictionaries };

type DictionaryResult = Awaited<ReturnType<typeof dictionaries['en']>>;
export type { DictionaryResult as Dictionary };

export async function getDictionary(locale: Locale): Promise<DictionaryResult> {
  const loader = dictionaries[locale];
  if (!loader) {
    throw new Error(`No dictionary found for locale: ${locale}`);
  }
  return loader();
}
