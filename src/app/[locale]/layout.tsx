import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function generateStaticParams() {
  return routing.locales.map((locale: string) => ({ locale }));
}

export const metadata: Metadata = {
  title: "क्षेत्रिकः (Kshetrikah)",
};

const RTL_LOCALES = ['ur', 'ks', 'sd'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  unstable_setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const isRtl = RTL_LOCALES.includes(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        lang={locale}
        className={`min-h-screen flex flex-col ${isRtl ? 'font-arabic text-right' : ''}`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </NextIntlClientProvider>
  );
}
