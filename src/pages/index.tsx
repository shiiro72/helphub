import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/organisms/Navbar";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";
import { Heart, HandHelping } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTranslations } from 'next-intl';
import { GetStaticProps } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const t = useTranslations();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black font-sans`}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white">
            {t('welcome_main')} <br />
            <span className="text-zinc-500">{t('welcome_meets')}</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t('hero_description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {user ? (
              <>
                <Link href="/requests">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <HandHelping size={20} />
                    {t('ask_for_help')}
                  </Button>
                </Link>
                <Link href="/offers">
                  <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                    <Heart size={20} />
                    {t('offer_help')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">{t('get_started')}</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">{t('learn_more')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2">{t('request_help_title')}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {t('request_help_desc')}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2">{t('offer_skills_title')}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {t('offer_skills_desc')}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2">{t('build_community_title')}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {t('build_community_desc')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
