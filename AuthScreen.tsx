import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '../types';
import { authenticateUser, loadUsers, registerUser } from '../utils/auth';
import { LockKeyhole, Recycle, UserRoundPlus } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
  initialError?: string;
}

type AuthTab = 'login' | 'register';
type RegisterFields = {
  fullName: string;
  mobile: string;
  pin: string;
  confirmPin: string;
};

const EMPTY_FIELDS: RegisterFields = {
  fullName: '',
  mobile: '',
  pin: '',
  confirmPin: '',
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, initialError }) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [fields, setFields] = useState<RegisterFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFields | 'mobile' | 'pin', string>>>({});
  const [message, setMessage] = useState(initialError || '');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        setLockedUntil(0);
        setAttempts(0);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const registerErrors = useMemo(() => {
    const next: Partial<Record<keyof RegisterFields, string>> = {};
    if (!fields.fullName.trim()) next.fullName = 'Enter your full name';
    if (!/^[6-9]\d{9}$/.test(fields.mobile)) next.mobile = 'Enter a 10-digit mobile number starting with 6–9';
    if (!/^\d{4}$/.test(fields.pin)) next.pin = 'PIN must be exactly 4 digits';
    if (fields.confirmPin !== fields.pin || !fields.confirmPin) next.confirmPin = 'PINs must match';
    return next;
  }, [fields]);

  const setRegisterField = <K extends keyof RegisterFields>(key: K, value: RegisterFields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setMessage('');
  };

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setMessage('');
    setErrors({});
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    const nextErrors: typeof errors = {};
    if (!/^[6-9]\d{9}$/.test(mobile)) nextErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!/^\d{4}$/.test(pin)) nextErrors.pin = 'PIN must be exactly 4 digits';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (lockedUntil > Date.now()) return;

    setIsSubmitting(true);
    try {
      const user = await authenticateUser(mobile, pin);
      if (user) {
        setAttempts(0);
        onAuthenticated(user);
      } else {
        const registered = loadUsers().some((candidate) => candidate.mobile === mobile);
        if (!registered) {
          switchTab('register');
          setRegisterField('mobile', mobile);
          setMessage('Please register first');
        } else {
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);
          setMessage('Incorrect PIN');
          setErrors({ pin: 'Incorrect PIN' });
          if (nextAttempts >= 3) {
            setLockedUntil(Date.now() + 30_000);
            setSecondsRemaining(30);
          }
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setErrors(registerErrors);
    setMessage('');
    if (Object.keys(registerErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const user = await registerUser({
        fullName: fields.fullName,
        mobile: fields.mobile,
        pin: fields.pin,
      });
      onAuthenticated(user);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (invalid: boolean) =>
    `mt-1 w-full min-h-11 rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 dark:bg-slate-800 dark:text-white ${
      invalid ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
    }`;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-emerald-700 px-6 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Recycle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold">Waste-Picker Route Helper</h1>
              <p className="text-sm text-emerald-100">Pune · Secure picker access</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div role="tablist" aria-label="Authentication" className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => switchTab(item)}
                className={`min-h-11 rounded-lg text-sm font-bold capitalize ${
                  tab === item ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400' : 'text-slate-500'
                }`}
              >
                {item === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {message && (
            <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {message}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mobile Number
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) => {
                    setMobile(event.target.value.replace(/\D/g, '').slice(0, 10));
                    setErrors((current) => ({ ...current, mobile: undefined, pin: undefined }));
                    setMessage('');
                  }}
                  className={fieldClass(Boolean(errors.mobile))}
                  aria-invalid={Boolean(errors.mobile)}
                />
                {errors.mobile && <span className="mt-1 block text-xs text-rose-600">{errors.mobile}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                4-digit PIN
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={4}
                  value={pin}
                  onChange={(event) => {
                    setPin(event.target.value.replace(/\D/g, '').slice(0, 4));
                    setErrors((current) => ({ ...current, pin: undefined }));
                    setMessage('');
                  }}
                  className={fieldClass(Boolean(errors.pin))}
                  aria-invalid={Boolean(errors.pin)}
                />
                {errors.pin && <span className="mt-1 block text-xs text-rose-600">{errors.pin}</span>}
              </label>
              {secondsRemaining > 0 && (
                <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  Login locked. Try again in {secondsRemaining}s.
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || secondsRemaining > 0}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole className="h-4 w-4" />
                {isSubmitting ? 'Please wait…' : 'Login'}
              </button>
              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Demo: 9000000001 / PIN 1234
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} noValidate className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Full Name
                <input value={fields.fullName} onChange={(e) => setRegisterField('fullName', e.target.value)} className={fieldClass(Boolean(errors.fullName))} />
                {errors.fullName && <span className="mt-1 block text-xs text-rose-600">{errors.fullName}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mobile Number
                <input type="tel" inputMode="numeric" maxLength={10} value={fields.mobile} onChange={(e) => setRegisterField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} className={fieldClass(Boolean(errors.mobile))} />
                {errors.mobile && <span className="mt-1 block text-xs text-rose-600">{errors.mobile}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                4-digit PIN
                <input type="password" inputMode="numeric" maxLength={4} value={fields.pin} onChange={(e) => setRegisterField('pin', e.target.value.replace(/\D/g, '').slice(0, 4))} className={fieldClass(Boolean(errors.pin))} />
                {errors.pin && <span className="mt-1 block text-xs text-rose-600">{errors.pin}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Confirm PIN
                <input type="password" inputMode="numeric" maxLength={4} value={fields.confirmPin} onChange={(e) => setRegisterField('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 4))} className={fieldClass(Boolean(errors.confirmPin))} />
                {errors.confirmPin && <span className="mt-1 block text-xs text-rose-600">{errors.confirmPin}</span>}
              </label>
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                A unique SWaCH Member ID will be allocated automatically after registration. You’ll choose your zone after login.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserRoundPlus className="h-4 w-4" />
                {isSubmitting ? 'Registering…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
