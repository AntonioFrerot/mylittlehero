import type { Metadata, Viewport } from "next";
import { AnalyticsArrivalBeacon } from "@/components/analytics/AnalyticsArrivalBeacon";
import { HashScrollHandler } from "@/components/HashScrollHandler";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { AdminSupportAlertRoot } from "@/components/admin/AdminSupportAlertRoot";
import { SupportChatLazy } from "@/components/support/SupportChatLazy";
import { WelcomeSampleOfferRoot } from "@/components/espace/WelcomeSampleOfferRoot";
import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { getTicketBalanceForUser } from "@/lib/purchases/tickets";
import { getJetonBalanceForUser } from "@/lib/purchases/jetons";
import { BRAND_NAME } from "@/lib/brand";
import { getServerLocale, getServerTranslator } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/translator";
import { buildFrenchRootMetadata } from "@/lib/i18n/metadata";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildFrenchRootMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, session] = await Promise.all([getServerLocale(), getSession()]);
  const initialIsAdmin = session ? isAdminEmail(session.email) : false;
  const initialBalance = session ? await getTicketBalanceForUser(session.email) : null;
  const initialJetonBalance = session
    ? await getJetonBalanceForUser(session.email)
    : null;

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${fraunces.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-cinema-black font-sans text-cream antialiased">
        <LocaleProvider locale={locale} messages={getMessages(locale)}>
          <AuthProvider
            initialUser={session}
            initialIsAdmin={initialIsAdmin}
            initialBalance={initialBalance}
            initialJetonBalance={initialJetonBalance}
          >
            <WelcomeSampleOfferRoot>
              <HashScrollHandler />
              <AnalyticsArrivalBeacon />
              <Header />
              <AdminSupportAlertRoot />
              {children}
              <SupportChatLazy />
            </WelcomeSampleOfferRoot>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
