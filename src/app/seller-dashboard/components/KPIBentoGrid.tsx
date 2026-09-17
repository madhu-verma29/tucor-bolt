'use client';

import React from 'react';
import {
  Droplets,
  CheckCircle2,
  ListChecks,
  ShoppingCart,
  CreditCard,
  Leaf,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { sellerProfile } from '@/lib/mock-data';
import Icon from '@/components/ui/AppIcon';


interface KPICardProps {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  variant?: 'default' | 'hero' | 'warning' | 'success' | 'amber';
  onClick?: () => void;
}

function KPICard({ icon: Icon, label, value, sublabel, trend, variant = 'default', onClick }: KPICardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    hero: 'gradient-card-green text-white border-transparent',
    warning: 'bg-warning-bg border-warning/30',
    success: 'bg-success-bg border-success/30',
    amber: 'gradient-card-amber text-white border-transparent',
  };

  const iconBgStyles = {
    default: 'bg-secondary text-primary',
    hero: 'bg-white/20 text-white',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    amber: 'bg-white/20 text-white',
  };

  const labelStyles = {
    default: 'text-muted-foreground',
    hero: 'text-white/70',
    warning: 'text-warning/80',
    success: 'text-success/80',
    amber: 'text-white/70',
  };

  const valueStyles = {
    default: 'text-foreground',
    hero: 'text-white',
    warning: 'text-warning',
    success: 'text-success',
    amber: 'text-white',
  };

  const sublabelStyles = {
    default: 'text-muted-foreground',
    hero: 'text-white/60',
    warning: 'text-warning/70',
    success: 'text-success/70',
    amber: 'text-white/60',
  };

  return (
    <div
      onClick={onClick}
      className={`card p-5 border ${variantStyles[variant]} hover:shadow-card-hover transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgStyles[variant]}`}>
          <Icon size={18} />
        </div>
        {variant === 'warning' && (
          <AlertTriangle size={16} className="text-warning" />
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend.direction === 'up' ? 'text-success' : trend.direction === 'down' ? 'text-danger' : 'text-muted-foreground'
          }`}>
            {trend.direction === 'up' ? <TrendingUp size={13} /> : trend.direction === 'down' ? <TrendingDown size={13} /> : null}
            {trend.label}
          </div>
        )}
      </div>
      <div>
        <div className={`metric-label mb-1 ${labelStyles[variant]}`}>{label}</div>
        <div className={`font-mono-data text-2xl font-bold leading-tight ${valueStyles[variant]}`}>{value}</div>
        <div className={`text-xs mt-1 ${sublabelStyles[variant]}`}>{sublabel}</div>
      </div>
    </div>
  );
}

interface Props {
  onNavigate: (id: string) => void;
}

export default function KPIBentoGrid({ onNavigate }: Props) {
  // Grid plan: 6 cards → grid-cols-2 md:grid-cols-3 xl:grid-cols-6
  // Row 1 (xl): hero spans 2 cols + 4 regular = 6 cols total
  // Row 1 (md): 3 per row × 2 rows
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Hero: UCO Available — spans 2 cols */}
      <div className="col-span-2">
        <KPICard
          id="kpi-uco-available"
          icon={Droplets}
          label="UCO Available"
          value="940 L"
          sublabel="Across 3 active listings — ready for matching"
          trend={{ direction: 'up', label: '+12% vs last month' }}
          variant="hero"
          onClick={() => onNavigate('listings')}
        />
      </div>

      {/* UCO Collected */}
      <KPICard
        id="kpi-uco-collected"
        icon={CheckCircle2}
        label="UCO Collected"
        value={`${(sellerProfile.totalUCOCollected / 1000).toFixed(1)}K L`}
        sublabel="Lifetime total — 67 collections"
        trend={{ direction: 'up', label: '+8.4% YoY' }}
        variant="success"
        onClick={() => onNavigate('pickups')}
      />

      {/* Active Listings */}
      <KPICard
        id="kpi-listings"
        icon={ListChecks}
        label="Active Listings"
        value="3"
        sublabel="1 pending verification"
        trend={{ direction: 'neutral', label: 'Stable' }}
        variant="default"
        onClick={() => onNavigate('listings')}
      />

      {/* Pending Orders — warning state */}
      <KPICard
        id="kpi-orders"
        icon={ShoppingCart}
        label="Pending Orders"
        value="2"
        sublabel="ORD-0149 needs attention"
        variant="warning"
        onClick={() => onNavigate('orders')}
      />

      {/* Next Payment */}
      <KPICard
        id="kpi-payment"
        icon={CreditCard}
        label="Next Payment Due"
        value="₹9,610"
        sublabel="Due Sep 19 — PAY-2026-0071"
        trend={{ direction: 'neutral', label: 'On schedule' }}
        variant="amber"
        onClick={() => onNavigate('payments')}
      />

      {/* CO₂ Offset — full width on last row on some breakpoints */}
      <div className="col-span-2 md:col-span-1 xl:col-span-2">
        <KPICard
          id="kpi-co2"
          icon={Leaf}
          label="CO₂ Offset (Est.)"
          value={`${(sellerProfile.co2OffsetKg / 1000).toFixed(1)}T kg`}
          sublabel="Lifetime · 1.4 kg offset per liter"
          trend={{ direction: 'up', label: '+907 kg this month' }}
          variant="success"
          onClick={() => onNavigate('sustainability')}
        />
      </div>
    </div>
  );
}