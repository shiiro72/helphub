import { AuthForm } from '@/components/organisms/AuthForm';
import { Navbar } from '@/components/organisms/Navbar';
import Head from 'next/head';
import { GetStaticProps } from 'next';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-background">
      <Head>
        <title>Login | HelpHub</title>
      </Head>
      <Navbar />
      <main className="flex items-center justify-center p-6 mt-12">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
