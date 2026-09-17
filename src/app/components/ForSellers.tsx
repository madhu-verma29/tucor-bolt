import React from 'react';
import Link from 'next/link';
import { IndianRupee, Calendar, ShieldCheck, BarChart3, Leaf, Clock } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const benefits = [
  {
    id: 'seller-revenue',
    icon: IndianRupee,
    title: 'Earn from Waste Oil',
    description: 'Turn your used cooking oil into a recurring revenue stream. Get paid within 7 days of collection.',
    stat: '₹18–₹33/L',
    statLabel: 'Current platform rate',
  },
  {
    id: 'seller-pickup',
    icon: Calendar,
    title: 'Scheduled Pickups',
    description: 'TUCOR coordinates collection at your preferred time. No logistics headache — we handle everything.',
    stat: '48hr',
    statLabel: 'Avg. pickup scheduling',
  },
  {
    id: 'seller-verified',
    icon: ShieldCheck,
    title: 'Verified & Compliant',
    description: 'FSSAI-compliant disposal documentation provided. Stay audit-ready with zero effort.',
    stat: '100%',
    statLabel: 'Compliance documentation',
  },
  {
    id: 'seller-impact',
    icon: Leaf,
    title: 'Track Your Impact',
    description: 'Real-time CO₂ offset dashboard. Share impact certificates for CSR and sustainability reporting.',
    stat: '1.4 kg CO₂',
    statLabel: 'Offset per liter collected',
  },
  {
    id: 'seller-dashboard',
    icon: BarChart3,
    title: 'Full Visibility',
    description: 'See every listing, order, pickup, and payment in one dashboard. No surprises, no hidden fees.',
    stat: 'Live',
    statLabel: 'Dashboard updates',
  },
  {
    id: 'seller-support',
    icon: Clock,
    title: 'Dedicated Support',
    description: 'A TUCOR account manager is assigned to every verified seller. Reach us any time.',
    stat: '< 2hr',
    statLabel: 'Avg. response time',
  },
];

export default function ForSellers() {
  return (
    <section id="for-sellers" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Copy */}
          <div className="sticky top-24">
            <p className="section-label mb-3 text-primary">For Sellers</p>
            <h2 className="text-display-md text-foreground mb-6">
              Your Kitchen Waste<br />
              <span className="gradient-text-green">is Someone's Fuel</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Restaurants, hotels, cloud kitchens, and canteens across India generate thousands of liters of used cooking oil every month. TUCOR turns that liability into an asset — with verified buyers, managed logistics, and transparent payments.
            </p>

            {/* Eligibility */}
            <div className="card p-5 mb-6">
              <div className="text-sm font-semibold text-foreground mb-3">Who can sell on TUCOR?</div>
              <div className="flex flex-col gap-2">
                {['Restaurants & Dhabas', 'Hotels & Banquet Halls', 'Cloud Kitchens', 'Industrial Canteens', 'Food Processing Units', 'Catering Companies']?.map((type) => (
                  <div key={`seller-type-${type}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/sign-up-login" className="btn-primary">
              Register as a Seller
            </Link>
          </div>

          {/* Right: Benefits grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits?.map((b) => {
              const Icon = b?.icon;
              return (
                <div key={b?.id} className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{b?.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{b?.description}</p>
                  <div className="pt-3 border-t border-border">
                    <span className="font-mono-data font-bold text-primary text-lg">{b?.stat}</span>
                    <span className="text-xs text-muted-foreground ml-2">{b?.statLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}