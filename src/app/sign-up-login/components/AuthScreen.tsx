'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Leaf } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { authApi } from '@/lib/auth-api';
import { toast } from 'sonner';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] gradient-hero flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <AppLogo size={40} />
          <span className="font-extrabold text-2xl text-white">TUCOR</span>
        </div>

        {/* Center content */}
        <div className="relative flex flex-col gap-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Give Used Cooking Oil<br />
              <span className="text-amber-DEFAULT">a Second Life</span>
            </h2>
            <p className="text-green-light text-base leading-relaxed max-w-sm">
              India's trusted managed marketplace for UCO recovery — connecting verified sellers with certified buyers.
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="flex flex-col gap-3">
            {[
              {
                id: 'test-priya',
                name: 'Priya Nambiar',
                role: 'Cloud Kitchen Owner, Mumbai',
                quote: 'TUCOR turned our monthly UCO disposal problem into ₹18,000 in extra revenue.',
              },
              {
                id: 'test-arjun',
                name: 'Arjun Krishnamurthy',
                role: 'Procurement Head, BioFuel India',
                quote: 'Consistent, quality-graded UCO supply with full traceability. Exactly what we needed.',
              },
            ].map((t) => (
              <div key={t.id} className="glass-card rounded-2xl p-4">
                <p className="text-sm text-white/80 italic mb-3">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-green-light">{t.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2">
            {['FSSAI Compliant', 'GST Verified', '840+ Businesses', '2.4M Liters Recovered'].map((b) => (
              <span
                key={`auth-badge-${b}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-card text-green-light"
              >
                <Leaf size={10} />
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-green-light/40">
          © 2026 TUCOR Technologies Pvt. Ltd.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
          <div className="flex items-center gap-2 lg:hidden">
            <AppLogo size={32} />
            <span className="font-extrabold text-lg text-foreground">TUCOR</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-10 overflow-y-auto">
          <div className="w-full max-w-md">
            {mode === 'login' && (
              <LoginForm
                onRegister={() => setMode('register')}
                onForgot={() => setMode('forgot')}
              />
            )}
            {mode === 'register' && (
              <RegisterForm onLogin={() => setMode('login')} />
            )}
            {mode === 'forgot' && (
              <ForgotPasswordForm onBack={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
      <p className="text-muted-foreground text-sm mb-8">
        Enter your registered email and we'll send a reset link.
      </p>
      {sent ? (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">📧</div>
          <div className="font-semibold text-foreground mb-2">Check your inbox</div>
          <p className="text-sm text-muted-foreground mb-4">
            A password reset link has been sent to <strong>{email}</strong>. Valid for 30 minutes.
          </p>
          <button onClick={onBack} className="btn-outline w-full">Back to Sign In</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label-text">Registered Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="priya@spiceroute.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : 'Send Reset Link'}
          </button>
          <button type="button" onClick={onBack} className="btn-ghost w-full justify-center">
            ← Back to Sign In
          </button>
        </form>
      )}
    </div>
  );
}