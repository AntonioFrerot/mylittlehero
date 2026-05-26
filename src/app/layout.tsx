import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";
import { BRAND_NAME } from "@/lib/brand";
import { getServerLocale, getServerTranslator } from "@/lib/i18n/server";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${BRAND_NAME} — ${t("meta.title")}`,
    description: t("meta.description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${fraunces.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-cinema-black font-sans text-cream antialiased">
        <LocaleProvider locale={locale}>
          {children}
          <SupportChatWidget />
        </LocaleProvider>
      </body>
    </html>
  );
}
