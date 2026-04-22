import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import { PresenceProvider } from '@/lib/contexts/PresenceContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider
      locale={router.locale || 'en'}
      messages={pageProps.messages}
    >
      <PresenceProvider>
        <div className={`${plusJakartaSans.variable} ${beVietnamPro.variable} font-sans`}>
          <Component {...pageProps} />
        </div>
      </PresenceProvider>
    </NextIntlClientProvider>
  );
}
