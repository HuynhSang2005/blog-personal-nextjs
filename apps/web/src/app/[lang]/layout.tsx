import { Geist, Geist_Mono } from "next/font/google";
import { i18nConfig, type Locale } from "@blog/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return {
    title: {
      default: "My Blog",
      template: "%s | My Blog",
    },
    description: "Personal blog built with Next.js 16 + Turborepo + Bun",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
