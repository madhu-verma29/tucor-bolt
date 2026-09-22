'use client';

import React, { useEffect, useState } from 'react';
import { Leaf, Droplets, TrendingUp, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '@/components/ui/AppIcon';
import { buyerApi, type BuyerOrder } from '@/lib/buyer-api';


const monthlyImpact = [
  { month: 'Apr', ucoSourced: 1200, co2Offset: 1680, biodieselEquiv: 1080 },
  { month: 'May', ucoSourced: 1850, co2Offset: 2590, biodieselEquiv: 1665 },
  { month: 'Jun', ucoSourced: 1400, co2Offset: 1960, biodieselEquiv: 1260 },
  { month: 'Jul', ucoSourced: 2100, co2Offset: 2940, biodieselEquiv: 1890 },
  { month: 'Aug', ucoSourced: 2800, co2Offset: 3920, biodieselEquiv: 2520 },
  { month: 'Sep', ucoSourced: 1120, co2Offset: 1568, biodieselEquiv: 1008 },
];

const totalUCO = monthlyImpact.reduce((s, d) => s + d.ucoSourced, 0);
const totalCO2 = monthlyImpact.reduce((s, d) => s + d.co2Offset, 0);
const totalBiodiesel = monthlyImpact.reduce((s, d) => s + d.biodieselEquiv, 0);

const impactMilestones = [
  { label: 'UCO Sourced', value: `${(totalUCO / 1000).toFixed(1)}K L`, desc: 'Total used cooking oil procured', icon: Droplets, color: 'text-info', bg: 'bg-info-bg', achieved: true },
  { label: 'CO₂ Offset', value: `${(totalCO2 / 1000).toFixed(1)}T`, desc: 'Estimated carbon dioxide offset', icon: Leaf, color: 'text-primary', bg: 'bg-primary/10', achieved: true },
  { label: 'Biodiesel Equivalent', value: `${(totalBiodiesel / 1000).toFixed(1)}K L`, desc: 'Estimated biodiesel produced', icon: TrendingUp, color: 'text-success', bg: 'bg-success-bg', achieved: true },
  { label: 'Sustainability Score', value: '87/100', desc: 'TUCOR circular economy rating', icon: Award, color: 'text-warning', bg: 'bg-warning-bg', achieved: true },
];

export default function BuyerSustainabilitySection() {
  const [apiOrders,setApiOrders]=useState<BuyerOrder[]>([]);useEffect(()=>{buyerApi.orders().then(setApiOrders).catch(()=>setApiOrders([]));},[]);
  const [period, setPeriod] = useState<'3m' | '6m'>('6m');
  const data = period === '3m' ? monthlyImpact.slice(-3) : monthlyImpact;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sustainability Impact</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your contribution to the circular economy — UCO sourced, CO₂ offset, and renewable feedstock
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['3m', '6m'] as const).map((p) => (
            <button
              key={`sustain-period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '3m' ? '3 Months' : '6 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Impact banner */}
      <div className="card p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <Leaf size={20} className="text-primary" />
          <h3 className="font-bold text-foreground">Your Environmental Impact</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By sourcing UCO through TUCOR, BioFuel India Pvt. Ltd. has diverted <strong className="text-foreground">{totalUCO.toLocaleString('en-IN')} liters</strong> of used cooking oil from landfills, offsetting an estimated <strong className="text-foreground">{(totalCO2 / 1000).toFixed(1)} tonnes of CO₂</strong> and contributing to India's renewable energy goals.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {impactMilestones.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={`sustain-kpi-${kpi.label}`} className="card p-5">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={kpi.color} />
              </div>
              <div className={`text-2xl font-bold font-mono-data ${kpi.color} mb-1`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
              <div className="text-xs text-muted-foreground">{kpi.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">UCO Sourced per Month (Liters)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ucoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('en-IN')}L`, 'UCO Sourced']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="ucoSourced" stroke="var(--primary)" strokeWidth={2} fill="url(#ucoGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">CO₂ Offset per Month (kg)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('en-IN')} kg`, 'CO₂ Offset']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="co2Offset" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sustainability badges */}
      <div className="card p-5">
        <h3 className="font-bold text-foreground text-base mb-4">Sustainability Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🌱', label: 'Green Buyer', desc: 'Sourced 5,000L+ UCO', earned: true },
            { icon: '♻️', label: 'Circular Champion', desc: 'Completed 10+ orders', earned: true },
            { icon: '🌍', label: 'Carbon Reducer', desc: 'Offset 10T+ CO₂', earned: true },
            { icon: '⚡', label: 'Biodiesel Pioneer', desc: 'Produced 5,000L+ biodiesel', earned: false },
          ].map((badge) => (
            <div
              key={`badge-${badge.label}`}
              className={`p-4 rounded-xl border text-center ${badge.earned ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30 opacity-50'}`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-xs font-bold text-foreground">{badge.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
              {badge.earned && <span className="text-xs text-primary font-medium mt-1 block">Earned ✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
