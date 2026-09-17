'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Recycle, Zap, ChevronDown } from 'lucide-react';

const processSteps = [
  { icon: '🍳', label: 'Kitchen', sublabel: 'Restaurant / Hotel / Cloud Kitchen', color: 'from-orange-400 to-amber-500' },
  { icon: '🛢️', label: 'Used Oil', sublabel: 'Collected & Stored On-Site', color: 'from-amber-500 to-yellow-600' },
  { icon: '✅', label: 'TUCOR Platform', sublabel: 'Verified, Listed & Matched', color: 'from-primary to-accent' },
  { icon: '🚛', label: 'Collection', sublabel: 'Scheduled Pickup by TUCOR', color: 'from-green-500 to-emerald-600' },
  { icon: '⚡', label: 'Renewable', sublabel: 'Biodiesel / Renewable Feedstock', color: 'from-blue-500 to-cyan-500' },
  { icon: '🔄', label: 'Circular Economy', sublabel: 'Closing the Loop', color: 'from-primary to-green-600' },
];

export default function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % processSteps?.length);
        setAnimating(false);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen gradient-hero flex flex-col justify-center overflow-hidden pt-16">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--amber), transparent)' }} />

      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full glass-card text-sm font-semibold text-green-light">
            <Leaf size={14} className="text-accent" />
            India's First Managed UCO Recovery Marketplace
          </div>

          {/* Headline */}
          <h1 className="text-display-xl text-white leading-tight text-balance">
            Give Used Cooking Oil
            <br />
            <span className="text-amber-DEFAULT">a Second Life</span>
          </h1>

          <p className="text-lg text-green-light leading-relaxed max-w-lg">
            TUCOR connects verified restaurants, hotels, and cloud kitchens with certified biodiesel manufacturers — through a fully managed, transparent platform. Earn revenue. Reduce waste. Offset carbon.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 py-2">
            {[
              { value: '2.4M', unit: 'Liters', label: 'UCO Recovered' },
              { value: '3,360', unit: 'Tonnes', label: 'CO₂ Offset' },
              { value: '840+', unit: 'Businesses', label: 'Participating' },
            ]?.map((stat) => (
              <div key={`hero-stat-${stat?.label}`} className="flex flex-col">
                <span className="font-mono-data text-2xl font-bold text-white">
                  {stat?.value}{' '}
                  <span className="text-sm font-sans font-medium text-green-light">{stat?.unit}</span>
                </span>
                <span className="text-xs text-green-light/70 font-medium">{stat?.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95"
              style={{ background: 'var(--amber)', color: '#1c2b1e' }}
            >
              Start Selling UCO
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm glass-card text-white hover:bg-white/10 transition-all duration-150 active:scale-95"
            >
              Source UCO Supply
              <Zap size={16} />
            </Link>
          </div>

          <p className="text-xs text-green-light/60">
            Free to register · FSSAI-compliant · Payments within 7 days
          </p>
        </div>

        {/* Right: Process Animation */}
        <div className="flex flex-col items-center gap-6">
          {/* Main animated card */}
          <div
            className={`w-full max-w-sm glass-card rounded-3xl p-8 flex flex-col items-center gap-4 transition-all duration-300 ${
              animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="text-6xl animate-float">{processSteps?.[activeStep]?.icon}</div>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">{processSteps?.[activeStep]?.label}</div>
              <div className="text-sm text-green-light">{processSteps?.[activeStep]?.sublabel}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {processSteps?.map((_, i) => (
                <button
                  key={`step-dot-${i}`}
                  onClick={() => setActiveStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeStep ? 'w-6 bg-amber-DEFAULT' : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step flow */}
          <div className="w-full max-w-sm grid grid-cols-3 gap-2">
            {processSteps?.map((step, i) => (
              <button
                key={`step-card-${i}`}
                onClick={() => setActiveStep(i)}
                className={`p-3 rounded-xl glass-card text-center transition-all duration-200 ${
                  i === activeStep ? 'ring-2 ring-amber-DEFAULT' : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="text-xl mb-1">{step?.icon}</div>
                <div className="text-xs text-white font-medium leading-tight">{step?.label}</div>
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {['FSSAI Compliant', 'GST Verified', 'Secure Payments', 'Carbon Certified']?.map((badge) => (
              <span
                key={`trust-badge-${badge}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-card text-green-light"
              >
                <Recycle size={11} />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-green-light/50 animate-bounce">
        <span className="text-xs">Scroll to explore</span>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}