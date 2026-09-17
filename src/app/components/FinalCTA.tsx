import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold text-green-light mb-6">
          <Leaf size={14} className="text-accent" />
          Join 840+ businesses on TUCOR
        </div>
        <h2 className="text-display-lg text-white mb-6 text-balance">
          Ready to Give Your UCO<br />
          <span className="text-amber-DEFAULT">a Second Life?</span>
        </h2>
        <p className="text-green-light text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Registration is free. Verification takes 24–48 hours. Your first collection could be scheduled within the week.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up-login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base active:scale-95 transition-all duration-150"
            style={{ background: 'var(--amber)', color: '#1c2b1e' }}
          >
            Register as a Seller
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/sign-up-login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base glass-card text-white hover:bg-white/10 active:scale-95 transition-all duration-150"
          >
            Register as a Buyer
            <ArrowRight size={18} />
          </Link>
        </div>
        <p className="text-green-light/50 text-xs mt-8">
          No setup fees · No minimum volume · Cancel anytime
        </p>
      </div>
    </section>
  );
}