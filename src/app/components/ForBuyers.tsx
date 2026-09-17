import React from 'react';
import Link from 'next/link';
import { Search, CheckCircle, FileText, MapPin, Layers, Award } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const benefits = [
  {
    id: 'buyer-supply',
    icon: Search,
    title: 'Consistent UCO Supply',
    description: 'Access a growing network of verified sellers across India. Search by location, oil type, volume, and availability.',
  },
  {
    id: 'buyer-quality',
    icon: CheckCircle,
    title: 'Quality Graded',
    description: 'Every UCO batch is graded A, B, or C by TUCOR before matching. Know exactly what you\'re sourcing.',
  },
  {
    id: 'buyer-docs',
    icon: FileText,
    title: 'Full Traceability',
    description: 'Chain-of-custody documentation for every order. Feedstock provenance records for regulatory compliance.',
  },
  {
    id: 'buyer-location',
    icon: MapPin,
    title: 'Location-Based Matching',
    description: 'Filter UCO supply by proximity to reduce logistics costs. TUCOR optimizes collection routes.',
  },
  {
    id: 'buyer-volume',
    icon: Layers,
    title: 'Aggregated Volume',
    description: 'TUCOR aggregates supply from multiple sellers to meet large-volume procurement requirements.',
  },
  {
    id: 'buyer-certified',
    icon: Award,
    title: 'Certified Feedstock',
    description: 'ISCC and sustainability-certified UCO available for advanced biofuel producers and exporters.',
  },
];

export default function ForBuyers() {
  return (
    <section id="for-buyers" className="py-20 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Benefits */}
          <div className="grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
            {benefits?.map((b) => {
              const Icon = b?.icon;
              return (
                <div key={b?.id} className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center mb-3">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">{b?.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b?.description}</p>
                </div>
              );
            })}
          </div>

          {/* Right: Copy */}
          <div className="sticky top-24 order-1 lg:order-2">
            <p className="section-label mb-3 text-accent">For Buyers</p>
            <h2 className="text-display-md text-foreground mb-6">
              Reliable UCO Supply<br />
              <span className="gradient-text-green">Built for Scale</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Biodiesel manufacturers, recyclers, and aggregators need consistent, quality-verified UCO at scale. TUCOR is the managed supply layer — handling seller verification, quality grading, logistics coordination, and documentation so your procurement team can focus on production.
            </p>

            {/* Buyer types */}
            <div className="card p-5 mb-6">
              <div className="text-sm font-semibold text-foreground mb-3">Who buys through TUCOR?</div>
              <div className="flex flex-col gap-2">
                {['Biodiesel Manufacturers', 'Renewable Energy Companies', 'UCO Aggregators & Traders', 'Animal Feed Processors', 'Soap & Oleochemical Plants', 'Export-oriented Refiners']?.map((type) => (
                  <div key={`buyer-type-${type}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/sign-up-login" className="btn-primary">
              Register as a Buyer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}