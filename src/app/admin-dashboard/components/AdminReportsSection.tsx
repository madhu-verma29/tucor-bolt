'use client';

import React, { useEffect, useState } from 'react';
import { Download, Building2, Droplets, Leaf, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { adminApi, type AdminReports } from '@/lib/admin-api';


const reportTypes = [
  { id: 'platform', label: 'Platform Performance Report', desc: 'UCO recovery, order volumes, and business metrics', icon: '📊', period: 'Aug 2026' },
  { id: 'revenue', label: 'Revenue & Fees Report', desc: 'GMV, platform fees, and settlement reconciliation', icon: '💰', period: 'Aug 2026' },
  { id: 'sustainability', label: 'Sustainability Impact Report', desc: 'Total CO₂ offset, circular economy contribution', icon: '🌿', period: 'FY 2025–26' },
  { id: 'users', label: 'User & Business Report', desc: 'Registration, verification, and activity metrics', icon: '👥', period: 'Aug 2026' },
  { id: 'compliance', label: 'Compliance & Audit Report', desc: 'Document verification, dispute resolution summary', icon: '🛡️', period: 'FY 2025–26' },
];

export default function AdminReportsSection() {
  const [period, setPeriod] = useState<'3m' | '6m'>('6m');
  const [reports,setReports]=useState<AdminReports|null>(null);
  useEffect(()=>{adminApi.reports().then(setReports).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load reports'));},[]);
  const allVolume=reports?.platformVolume??[];const allRevenue=reports?.revenue??[];const userData=reports?.userGrowth??[];const oilData=reports?.oilTypes??[];
  const volumeData = period === '3m' ? allVolume.slice(-3) : allVolume;
  const revData = period === '3m' ? allRevenue.slice(-3) : allRevenue;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Admin Console · Platform-wide analytics and exportable reports</p>
        </div>
        <div className="flex items-center gap-2">
          {(['3m', '6m'] as const).map((p) => (
            <button
              key={`admin-rep-period-${p}`}
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

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total UCO Recovered', value: `${(reports?.summary.totalUcoRecovered??0).toLocaleString('en-IN')}L`, sub: 'All time', color: 'text-info', bg: 'bg-info-bg', icon: Droplets },
          { label: 'Platform Revenue', value: `₹${(reports?.summary.platformRevenue??0).toLocaleString('en-IN')}`, sub: 'Settled fees', color: 'text-success', bg: 'bg-success-bg', icon: DollarSign },
          { label: 'Active Businesses', value: String(reports?.summary.activeBusinesses??0), sub: 'Verified', color: 'text-primary', bg: 'bg-primary/10', icon: Building2 },
          { label: 'CO₂ Offset', value: `${((reports?.summary.co2OffsetKg??0)/1000).toFixed(1)}T`, sub: 'Estimated', color: 'text-primary', bg: 'bg-primary/10', icon: Leaf },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`admin-rep-stat-${stat.label}`} className="card p-5">
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

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">UCO Volume — Collected vs Sourced (L)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="srcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="collected" name="Collected" stroke="var(--primary)" strokeWidth={2} fill="url(#collGrad)" />
              <Area type="monotone" dataKey="sourced" name="Sourced" stroke="var(--chart-2)" strokeWidth={2} fill="url(#srcGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">Revenue & Platform Fees (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number, name: string) => [`₹${v.toLocaleString('en-IN')}`, name === 'revenue' ? 'GMV' : 'Fees']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" name="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fees" name="fees" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">User Growth — Sellers vs Buyers</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="sellers" name="Sellers" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="buyers" name="Buyers" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">UCO by Oil Type (Liters)</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={oilData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {oilData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('en-IN')}L`, 'Volume']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {oilData.map((item) => (
                <div key={`oil-legend-${item.name}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-mono-data text-xs font-semibold text-foreground">{(item.value / 1000).toFixed(1)}K L</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Downloadable reports */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base">Downloadable Reports</h3>
        </div>
        <div className="divide-y divide-border">
          {reportTypes.map((report) => (
            <div key={`admin-report-${report.id}`} className="px-5 py-4 flex items-center gap-4">
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
                  onClick={() => adminApi.downloadReport(report.id).then(()=>toast.success(`${report.label} downloaded`)).catch(e=>toast.error(e instanceof Error?e.message:'Report download failed'))}
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
