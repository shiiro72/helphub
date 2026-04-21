import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { Fredoka, Inter } from 'next/font/google';

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider
      locale={router.locale || 'en'}
      messages={pageProps.messages}
    >
      <div className={`${fredoka.variable} ${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </NextIntlClientProvider>
  );
}
