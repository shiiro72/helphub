import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { createClient } from '@/lib/supabase/client';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/api/auth/callback`,
              data: {
                full_name: username,
              },
            },
          });

    if (error) {
      setError(error.message);
    } else if (mode === 'register') {
      alert(t('check_email'));
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-brand-surface-container-lowest rounded-2xl shadow-lg border border-brand-outline-variant">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-text-main">
          {mode === 'login' ? t('welcome_back') : t('create_account')}
        </h1>
        <p className="text-sm text-brand-text-secondary">
          {mode === 'login' ? t('login_description') : t('register_description')}
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === 'register' && (
          <FormField
            id="username"
            label={t('username')}
            type="text"
            placeholder={t('username_placeholder')}
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <FormField
          id="email"
          label={t('email_label')}
          type="email"
          placeholder="name@example.com"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            if (mode === 'register' && !username && val.includes('@')) {
              setUsername(val.split('@')[0]);
            }
          }}
          required
        />
        <div className="relative">
          <FormField
            id="password"
            label={t('password_label')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-[38px] text-brand-text-secondary hover:text-brand-text-main"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" size="full" disabled={loading}>
          {loading ? (
            t('processing')
          ) : (
            <span className="flex items-center gap-2">
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {mode === 'login' ? t('sign_in') : t('sign_up')}
            </span>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-brand-outline-variant" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-brand-surface-container-lowest px-2 text-brand-text-secondary">
            {t('or_continue_with')}
          </span>
        </div>
      </div>

      <Button variant="outline" size="full" onClick={handleGoogleLogin}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </Button>

      <div className="text-center text-sm">
        {mode === 'login' ? (
          <p className="text-brand-text-secondary">
            {t('no_account')}{' '}
            <Link
              href="/register"
              className="text-brand-text-main font-semibold hover:underline"
            >
              {t('sign_up')}
            </Link>
          </p>
        ) : (
          <p className="text-brand-text-secondary">
            {t('have_account')}{' '}
            <Link
              href="/login"
              className="text-brand-text-main font-semibold hover:underline"
            >
              {t('sign_in')}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
