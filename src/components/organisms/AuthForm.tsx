import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { createClient } from '@/lib/supabase/client';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/lib/contexts/ToastContext';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations();
  const { showToast } = useToast();
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
      showToast(t('check_email'), 'success');
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      if (error.message.includes('rate limit') || error.status === 429) {
        setError(t('rate_limit_error'));
      } else {
        setError(error.message);
      }
    } else {
      showToast('Password reset email sent! Check your inbox.', 'success');
    }
    setLoading(false);
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

        {error && <p className="text-sm text-red-500">{error}</p>}

        {mode === 'login' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-xs text-brand-text-secondary hover:text-brand-text-main hover:underline"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        )}

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
