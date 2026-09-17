'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#for-sellers', label: 'For Sellers' },
  { href: '#for-buyers', label: 'For Buyers' },
  { href: '#sustainability', label: 'Sustainability' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-md border-b border-border shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AppLogo size={36} />
          <span className="font-extrabold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-150">
            TUCOR
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks?.map((link) => (
            <a
              key={`nav-${link?.href}`}
              href={link?.href}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            >
              {link?.label}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/sign-up-login" className="btn-ghost text-sm">
            Sign In
          </Link>
          <Link href="/admin-dashboard" className="text-xs px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-semibold hover:bg-amber-500/20 transition-colors duration-150">
            Admin
          </Link>
          <Link href="/buyer-dashboard" className="btn-secondary text-sm">
            Source UCO
          </Link>
          <Link href="/seller-dashboard" className="btn-primary text-sm">
            Sell UCO
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle compact />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-xl hover:bg-muted transition-all duration-150 text-muted-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-card-lg animate-fade-in-up">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks?.map((link) => (
              <a
                key={`mobile-nav-${link?.href}`}
                href={link?.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-150"
              >
                {link?.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
              <Link href="/sign-up-login" className="btn-ghost justify-center">
                Sign In
              </Link>
              <Link href="/sign-up-login" className="btn-primary justify-center">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}