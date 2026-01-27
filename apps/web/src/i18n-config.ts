import type { Locale } from "@blog/i18n";
import { i18nConfig } from "@blog/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

export async function getLangFromParams(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!i18nConfig.locales.includes(lang as Locale)) {
    notFound();
  }
  return lang as Locale;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = await getLangFromParams(params);
  return {
    metadataBase: new URL("https://your-domain.com"),
    alternates: {
      canonical: `/${lang}`,
      languages: i18nConfig.locales.reduce(
        (acc, locale) => {
          acc[locale] = `/${locale}`;
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  };
}
