'use client';

import React, { useState } from 'react';
import { UserCheck, ListPlus, GitMerge, Truck, CreditCard, BarChart3, ArrowRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const steps = [
  {
    id: 'step-register',
    number: '01',
    icon: UserCheck,
    title: 'Register & Verify',
    description:
      'Create your business account and submit FSSAI, GST, and address documents. TUCOR verifies your business within 24–48 hours.',
    detail: 'Verification includes document review, business address confirmation, and UCO storage capacity assessment.',
    color: 'text-primary',
    bg: 'bg-secondary',
  },
  {
    id: 'step-list',
    number: '02',
    icon: ListPlus,
    title: 'List Your UCO',
    description:
      'Sellers publish UCO listings with oil type, volume, grade, and collection frequency. TUCOR reviews each listing for quality compliance.',
    detail: 'Listings include oil type classification, approximate volume, collection schedule, and storage conditions.',
    color: 'text-accent',
    bg: 'bg-green-pale',
  },
  {
    id: 'step-match',
    number: '03',
    icon: GitMerge,
    title: 'TUCOR Matches',
    description:
      'Our platform intelligently matches seller listings with verified buyer demand — anonymously. Neither party sees the other\'s contact details.',
    detail: 'Matching considers location proximity, volume requirements, oil type compatibility, and delivery schedules.',
    color: 'text-earth',
    bg: 'bg-amber-light/20',
  },
  {
    id: 'step-pickup',
    number: '04',
    icon: Truck,
    title: 'Scheduled Pickup',
    description:
      'TUCOR coordinates collection logistics. A verified TUCOR agent arrives at the seller\'s location on the scheduled date and time.',
    detail: 'Sellers receive pickup confirmation with agent name, vehicle number, and estimated arrival window.',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  {
    id: 'step-payment',
    number: '05',
    icon: CreditCard,
    title: 'Transparent Payment',
    description:
      'Sellers receive payment within 7 business days of confirmed pickup. Buyers are invoiced separately. All transactions flow through TUCOR.',
    detail: 'Payment includes volume confirmation, grade-adjusted pricing, and a detailed TUCOR settlement invoice.',
    color: 'text-primary',
    bg: 'bg-secondary',
  },
  {
    id: 'step-impact',
    number: '06',
    icon: BarChart3,
    title: 'Track Your Impact',
    description:
      'Both sellers and buyers access real-time sustainability dashboards showing UCO recovered, CO₂ offset, and circular economy contribution.',
    detail: 'Impact certificates available for ESG reporting, CSR documentation, and regulatory compliance.',
    color: 'text-accent',
    bg: 'bg-green-pale',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="section-label mb-3">The TUCOR Process</p>
          <h2 className="text-display-md text-foreground mb-4">How TUCOR Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A fully managed, end-to-end process — from verification to settlement. TUCOR handles every step so you don't have to.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps?.map((step) => {
            const Icon = step?.icon;
            const isActive = activeStep === step?.id;
            return (
              <div
                key={step?.id}
                onClick={() => setActiveStep(isActive ? null : step?.id)}
                className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-card-hover ${
                  isActive ? 'ring-2 ring-primary shadow-card-hover' : ''
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step?.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={step?.color} />
                  </div>
                  <span className="font-mono-data text-3xl font-bold text-border">{step?.number}</span>
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{step?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step?.description}</p>
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                    <p className="text-sm text-foreground leading-relaxed">{step?.detail}</p>
                  </div>
                )}
                <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${step?.color} transition-all duration-150`}>
                  {isActive ? 'Show less' : 'Learn more'}
                  <ArrowRight size={12} className={`transition-transform duration-150 ${isActive ? 'rotate-90' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}