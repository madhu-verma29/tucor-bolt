'use client';

import React, { useEffect, useState } from 'react';
import { Leaf, Wind, Recycle, Award, Info } from 'lucide-react';
import { sellerApi, type SellerDashboard } from '@/lib/seller-api';
import SustainabilityChart from './SustainabilityChart';
import Icon from '@/components/ui/AppIcon';


export default function SustainabilityDashboard() {
  const [metrics,setMetrics]=useState<SellerDashboard|null>(null);useEffect(()=>{sellerApi.dashboard().then(setMetrics).catch(()=>{})},[]);
  const totalCO2 = metrics?.co2OffsetKg||0;
  const totalCollections = metrics?.collectionsCompleted||0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sustainability Impact</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your environmental contribution through TUCOR</p>
        </div>
        <button className="btn-secondary gap-2 text-sm">
          <Award size={15} />
          Download Certificate
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg border border-info/20">
        <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
        <p className="text-xs text-info leading-relaxed">
          <strong>Note:</strong> UCO Recovered and Collections Completed reflect actual TUCOR platform data. CO₂ offset figures are estimates based on IPCC lifecycle analysis (1.4 kg CO₂ per liter UCO-to-biodiesel). Actual offset may vary by processing method.
        </p>
      </div>

      {/* Impact KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'si-uco',
            icon: Recycle,
            label: 'UCO Recovered',
            value: `${((metrics?.totalUcoCollected||0) / 1000).toFixed(1)}K L`,
            sub: 'Actual platform data',
            actual: true,
            color: 'text-primary',
            bg: 'bg-secondary',
          },
          {
            id: 'si-co2',
            icon: Wind,
            label: 'CO₂ Offset',
            value: `${((metrics?.co2OffsetKg||0) / 1000).toFixed(1)}T kg`,
            sub: 'Estimated · IPCC basis',
            actual: false,
            color: 'text-accent',
            bg: 'bg-green-pale',
          },
          {
            id: 'si-collections',
            icon: Leaf,
            label: 'Collections',
            value: `${metrics?.collectionsCompleted||0}`,
            sub: 'Completed pickups',
            actual: true,
            color: 'text-success',
            bg: 'bg-success-bg',
          },
          {
            id: 'si-biodiesel',
            icon: Award,
            label: 'Biodiesel Equivalent',
            value: `${((metrics?.totalUcoCollected||0) * 0.88 / 1000).toFixed(1)}K L`,
            sub: 'Estimated · 0.88 L/L UCO',
            actual: false,
            color: 'text-earth',
            bg: 'bg-amber-light/20',
          },
        ]?.map((metric) => {
          const Icon = metric?.icon;
          return (
            <div key={metric?.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${metric?.bg} flex items-center justify-center`}>
                  <Icon size={18} className={metric?.color} />
                </div>
                <span className={metric?.actual ? 'badge-active text-xs' : 'badge-muted text-xs'}>
                  {metric?.actual ? 'Actual' : 'Estimated'}
                </span>
              </div>
              <div className={`font-mono-data text-2xl font-bold ${metric?.color} mb-1`}>{metric?.value}</div>
              <div className="text-xs font-medium text-foreground">{metric?.label}</div>
              <div className="text-xs text-muted-foreground">{metric?.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <SustainabilityChart />

      {/* CO₂ progress toward goal */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Annual CO₂ Offset Goal</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Target: 20,000 kg CO₂ by Dec {new Date().getFullYear()} · Estimated</p>
          </div>
          <span className="font-mono-data font-bold text-primary text-lg">
            {Math.round((totalCO2 / 20000) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full gradient-card-green transition-all duration-700"
            style={{ width: `${Math.min((totalCO2 / 20000) * 100, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span className="font-mono-data">{totalCO2?.toLocaleString('en-IN')} kg offset</span>
          <span className="font-mono-data">20,000 kg target</span>
        </div>
      </div>
    </div>
  );
}
