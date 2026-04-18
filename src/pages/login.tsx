import { AuthForm } from '@/components/organisms/AuthForm';
import { Navbar } from '@/components/organisms/Navbar';
import Head from 'next/head';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
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
