'use client';

import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, Droplets, Leaf, CreditCard, Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { sellerApi, type SellerTimeline } from '@/lib/seller-api';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { downloadCsv } from '@/lib/download-csv';


const reportTypes = [
  { id: 'monthly', label: 'Monthly Collection Report', desc: 'UCO volumes, oil types, and collection frequency', icon: '📦', period: new Date().toLocaleDateString('en-IN',{month:'short',year:'numeric'}) },
  { id: 'earnings', label: 'Earnings Summary', desc: 'Payment history, settlements, and payout breakdown', icon: '💰', period: new Date().toLocaleDateString('en-IN',{month:'short',year:'numeric'}) },
  { id: 'sustainability', label: 'Sustainability Impact Report', desc: 'CO₂ offset, circular economy contribution', icon: '🌿', period: `FY ${new Date().getFullYear()-1}–${String(new Date().getFullYear()).slice(-2)}` },
  { id: 'tax', label: 'Tax & GST Report', desc: 'GST-compliant transaction summary for accounting', icon: '🧾', period: `FY ${new Date().getFullYear()-1}–${String(new Date().getFullYear()).slice(-2)}` },
  { id: 'annual', label: 'Annual Performance Report', desc: 'Year-over-year UCO recovery and earnings growth', icon: '📊', period: `FY ${new Date().getFullYear()-1}–${String(new Date().getFullYear()).slice(-2)}` },
];

export default function ReportsSection() {
  const [monthlyEarnings,setMonthlyEarnings]=useState<SellerTimeline[]>([]);useEffect(()=>{sellerApi.dashboard().then(x=>setMonthlyEarnings(x.timeline)).catch(()=>setMonthlyEarnings([]))},[]);
  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('12m');

  const slicedData = period === '3m' ? monthlyEarnings.slice(-3) : period === '6m' ? monthlyEarnings.slice(-6) : monthlyEarnings;
  const totalEarnings = slicedData.reduce((s, d) => s + d.earnings, 0);
  const totalCollections = slicedData.reduce((s, d) => s + d.collectionsCount, 0);
  const totalUCO = slicedData.reduce((s, d) => s + d.ucoCollectedLiters, 0);
  const totalCO2 = slicedData.reduce((s, d) => s + d.co2OffsetKg, 0);
  const downloadReport=(label:string)=>{downloadCsv(`${label.toLowerCase().replaceAll(' ','-')}.csv`,[['Month','UCO Collected (L)','CO2 Offset (kg)','Collections','Earnings'],...slicedData.map(x=>[x.month,x.ucoCollectedLiters,x.co2OffsetKg,x.collectionsCount,x.earnings])]);toast.success(`${label} downloaded`)};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthly collection reports, earnings summaries, and exportable data
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['3m', '6m', '12m'] as const).map((p) => (
            <button
              key={`period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${(totalEarnings / 1000).toFixed(1)}K`, sub: `${totalCollections} collections`, color: 'text-success', bg: 'bg-success-bg', icon: CreditCard },
          { label: 'UCO Recovered', value: `${totalUCO.toLocaleString('en-IN')}L`, sub: 'Total volume', color: 'text-info', bg: 'bg-info-bg', icon: Droplets },
          { label: 'CO₂ Offset', value: `${(totalCO2 / 1000).toFixed(1)}T`, sub: 'Estimated impact', color: 'text-primary', bg: 'bg-primary/10', icon: Leaf },
          { label: 'Avg. Per Month', value: `₹${Math.round(totalEarnings / slicedData.length / 1000).toFixed(1)}K`, sub: 'Monthly average', color: 'text-foreground', bg: 'bg-muted', icon: TrendingUp },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`rep-stat-${stat.label}`} className="card p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className={`text-2xl font-bold font-mono-data ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">Monthly Earnings (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={slicedData}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Earnings']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="earnings" stroke="var(--primary)" strokeWidth={2} fill="url(#earningsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">Collections per Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={slicedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [v, 'Collections']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="collectionsCount" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Downloadable reports */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base">Downloadable Reports</h3>
        </div>
        <div className="divide-y divide-border">
          {reportTypes.map((report) => (
            <div key={`report-${report.id}`} className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{report.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{report.desc}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {report.period}
                </div>
                <button
                  onClick={() => downloadReport(report.label)}
                  className="btn-secondary py-1.5 text-xs gap-1.5"
                >
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
