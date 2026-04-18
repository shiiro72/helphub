import { Navbar } from "@/components/organisms/Navbar";
import { RequestBoard } from "@/components/organisms/RequestBoard";
import { Geist, Geist_Mono } from "next/font/google";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RequestsPage() {
  const { t } = useTranslation('common');

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black font-sans`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t('browse_requests')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Explore help requests from the community and lend a hand.
          </p>
        </div>

        <RequestBoard />
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});
