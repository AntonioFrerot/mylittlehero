import type { Metadata, Viewport } from "next";
import { HashScrollHandler } from "@/components/HashScrollHandler";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SupportChatLazy } from "@/components/support/SupportChatLazy";
import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { BRAND_NAME, SITE_LOGO_SRC } from "@/lib/brand";
import { getServerLocale, getServerTranslator } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/translator";
import { getTicketBalance } from "@/lib/purchases/tickets";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
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
    icons: {
      icon: SITE_LOGO_SRC,
      apple: SITE_LOGO_SRC,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const session = await getSession();
  const initialBalance = session ? await getTicketBalance(session.email) : null;
  const initialIsAdmin = session ? isAdminEmail(session.email) : false;

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${fraunces.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-cinema-black font-sans text-cream antialiased">
        <LocaleProvider locale={locale} messages={getMessages(locale)}>
          <AuthProvider
            initialUser={session}
            initialBalance={initialBalance}
            initialIsAdmin={initialIsAdmin}
          >
            <HashScrollHandler />
            {children}
            <SupportChatLazy />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
