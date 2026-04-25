import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/organisms/Navbar';
import { Button } from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a session (user clicked reset link)
    const supabase = createClient();
    supabase.auth.onAuthStateChange(async (event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        // We stay on the page
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const supabase = createClient();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <Head>
        <title>Reset Password | HelpHub</title>
      </Head>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-brand-surface-container-lowest rounded-2xl shadow-lg border border-brand-outline-variant">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text-main">
              Reset Your Password
            </h1>
            <p className="text-sm text-brand-text-secondary">Enter your new password below.</p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
              <p className="font-semibold">Password updated successfully!</p>
              <p className="text-sm">Redirecting you to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="relative">
                <FormField
                  id="password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={!showPassword ? 'text-brand-outline-variant' : 'text-brand-text-main'}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-brand-text-secondary hover:text-brand-text-main"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <FormField
                  id="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={!showConfirmPassword ? 'text-brand-outline-variant' : 'text-brand-text-main'}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-brand-text-secondary hover:text-brand-text-main"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" size="full" disabled={loading}>
                {loading ? (
                  t('processing')
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound size={18} />
                    Update Password
                  </span>
                )}
              </Button>
            </form>
          )}
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
