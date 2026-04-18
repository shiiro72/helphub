import { AuthForm } from '@/components/organisms/AuthForm';
import { Navbar } from '@/components/organisms/Navbar';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Head>
        <title>Register | HelpHub</title>
      </Head>
      <Navbar />
      <main className="flex items-center justify-center p-6 mt-12">
        <AuthForm mode="register" />
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});
