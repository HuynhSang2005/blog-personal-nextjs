import { i18nConfig } from './config';

export type Locale = (typeof i18nConfig)['locales'][number];
