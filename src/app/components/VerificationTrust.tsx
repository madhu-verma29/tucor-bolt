import React from 'react';
import { ShieldCheck, FileCheck, UserCheck, Lock, BadgeCheck, Eye } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const trustPillars = [
  {
    id: 'trust-identity',
    icon: UserCheck,
    title: 'Business Identity Verified',
    description: 'GST certificate, FSSAI license, and address proof reviewed by TUCOR compliance team.',
    badge: 'Identity',
  },
  {
    id: 'trust-docs',
    icon: FileCheck,
    title: 'Document Authentication',
    description: 'All uploaded documents are cross-verified against government databases where available.',
    badge: 'Documents',
  },
  {
    id: 'trust-quality',
    icon: BadgeCheck,
    title: 'UCO Quality Grading',
    description: 'Each batch graded A/B/C based on free fatty acid content, moisture, and impurity levels.',
    badge: 'Quality',
  },
  {
    id: 'trust-privacy',
    icon: Eye,
    title: 'Seller–Buyer Anonymity',
    description: 'Buyers and sellers never see each other\'s contact details. All communication flows through TUCOR.',
    badge: 'Privacy',
  },
  {
    id: 'trust-payments',
    icon: Lock,
    title: 'Escrow-Style Payments',
    description: 'Payment is held by TUCOR and released to sellers only after pickup confirmation — protecting both parties.',
    badge: 'Payments',
  },
  {
    id: 'trust-audit',
    icon: ShieldCheck,
    title: 'Full Audit Trail',
    description: 'Every order, pickup, and payment is logged with timestamps. Export for regulatory audits anytime.',
    badge: 'Audit',
  },
];

export default function VerificationTrust() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Trust & Verification</p>
          <h2 className="text-display-md text-foreground mb-4">
            Built on Trust, Backed by Verification
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every participant on TUCOR is verified. Every transaction is documented. Every pickup is tracked. This is how a circular economy marketplace earns trust at scale.
          </p>
        </div>

        {/* Central badge */}
        <div className="flex justify-center mb-12">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-secondary animate-pulse-slow" />
            <div className="relative w-24 h-24 rounded-full gradient-card-green flex items-center justify-center shadow-glow">
              <ShieldCheck size={40} className="text-white" />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trustPillars?.map((pillar) => {
            const Icon = pillar?.icon;
            return (
              <div key={pillar?.id} className="card p-6 hover:shadow-card-hover transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="badge-active text-xs">{pillar?.badge}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-2">{pillar?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar?.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}