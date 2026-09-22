'use client';

import React, { useEffect, useState } from 'react';
import KPIBentoGrid from './KPIBentoGrid';
import UCOCollectionChart from './UCOCollectionChart';
import OilTypeBreakdownChart from './OilTypeBreakdownChart';
import RecentOrdersPanel from './RecentOrdersPanel';
import UpcomingPickupsPanel from './UpcomingPickupsPanel';
import PaymentSummaryPanel from './PaymentSummaryPanel';
import { sellerApi } from '@/lib/seller-api';

interface Props {
  onNavigate: (id: string) => void;
}

export default function OverviewSection({ onNavigate }: Props) {
  const [name,setName]=useState('Seller');useEffect(()=>{sellerApi.profile().then(p=>setName(p.primaryContact||p.businessName||'Seller')).catch(()=>{})},[]);
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, {name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's your UCO recovery overview for today — {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live data · Updated just now
        </div>
      </div>

      {/* KPI Bento Grid */}
      <KPIBentoGrid onNavigate={onNavigate} />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <UCOCollectionChart />
        </div>
        <div className="xl:col-span-1">
          <OilTypeBreakdownChart />
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentOrdersPanel onNavigate={onNavigate} />
        </div>
        <div className="flex flex-col gap-5">
          <UpcomingPickupsPanel onNavigate={onNavigate} />
          <PaymentSummaryPanel onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
