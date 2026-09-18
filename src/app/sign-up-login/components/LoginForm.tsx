'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authApi, dashboardFor, saveSession } from '@/lib/auth-api';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const demoAccounts = [
  { id: 'demo-seller', role: 'Seller', email: 'priya@spiceroute.in', password: 'Tucor@Seller2026', description: 'Cloud Kitchen Owner' },
  { id: 'demo-buyer', role: 'Buyer', email: 'arjun@biofuelindia.com', password: 'Tucor@Buyer2026', description: 'Biodiesel Manufacturer' },
];

export default function LoginForm({
  onRegister,
  onForgot,
}: {
  onRegister: () => void;
  onForgot: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { rememberMe: false } });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDemoFill = (account: typeof demoAccounts[0]) => {
    setValue('email', account.email);
    setValue('password', account.password);
    toast.success(`Demo credentials filled for ${account.role}`);
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const tokens = await authApi.login(data.email, data.password, data.rememberMe);
      saveSession(tokens, data.rememberMe);
      toast.success('Welcome back! Redirecting to your dashboard...');
      router.push(dashboardFor(tokens.role));
    } catch (error) {
      setError('email', { message: error instanceof Error ? error.message : 'Unable to sign in' });
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Sign In to TUCOR</h2>
      <p className="text-muted-foreground text-sm mb-8">
        Don't have an account?{' '}
        <button onClick={onRegister} className="text-primary font-semibold hover:underline">
          Register free
        </button>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Email */}
        <div>
          <label className="label-text">Email Address</label>
          <input
            type="email"
            className={`input-field ${errors.email ? 'border-danger focus:ring-danger' : ''}`}
            placeholder="you@business.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-text mb-0">Password</label>
            <button type="button" onClick={onForgot} className="text-xs text-primary hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input-field pr-12 ${errors.password ? 'border-danger focus:ring-danger' : ''}`}
              placeholder="Your password"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded accent-primary"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Demo Accounts
        </p>
        <div className="flex flex-col gap-2">
          {demoAccounts.map((account) => (
            <div key={account.id} className="card p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`badge-active text-xs flex-shrink-0 ${account.role === 'Buyer' ? 'badge-info' : ''}`}>
                  {account.role}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{account.email}</div>
                  <div className="text-xs text-muted-foreground">{account.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(account.email, `email-${account.id}`)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors duration-100 text-muted-foreground"
                  title="Copy email"
                >
                  {copiedField === `email-${account.id}` ? (
                    <Check size={13} className="text-success" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill(account)}
                  className="text-xs btn-secondary py-1 px-3 h-auto"
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}