'use client';

import React, { useEffect, useState } from 'react';
import {
  Users, Building2, ShieldCheck, ShoppingCart, AlertTriangle,
  TrendingUp, TrendingDown, Droplets, Leaf, DollarSign, Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminApi, type AdminOverview } from '@/lib/admin-api';
import { toast } from 'sonner';

interface Props {
  onNavigate: (id: string) => void;
}

export default function AdminOverviewSection({ onNavigate }: Props) {
  const [overview,setOverview]=useState<AdminOverview|null>(null);
  useEffect(()=>{adminApi.overview().then(setOverview).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load overview'));},[]);
  const iconConfig:Record<string,{icon:React.ElementType;color:string;bg:string}>={
    'Total Users':{icon:Users,color:'text-blue-500',bg:'bg-blue-500/10'},'Verified Businesses':{icon:Building2,color:'text-primary',bg:'bg-primary/10'},'Pending Approvals':{icon:ShieldCheck,color:'text-amber-500',bg:'bg-amber-500/10'},'Active Orders':{icon:ShoppingCart,color:'text-indigo-500',bg:'bg-indigo-500/10'},'UCO Recovered (L)':{icon:Droplets,color:'text-cyan-500',bg:'bg-cyan-500/10'},'Platform Revenue':{icon:DollarSign,color:'text-emerald-500',bg:'bg-emerald-500/10'},'Open Disputes':{icon:AlertTriangle,color:'text-red-500',bg:'bg-red-500/10'},'CO₂ Offset (kg)':{icon:Leaf,color:'text-green-500',bg:'bg-green-500/10'}};
  const displayKpis=(overview?.kpis??[]).map(k=>({...k,...(iconConfig[k.label]||{icon:Activity,color:'text-primary',bg:'bg-primary/10'})}));
  const displayVolume=overview?.platformVolume??[];const displayOrderStatus=overview?.orderStatus??[];const displayRevenue=overview?.revenue??[];const displayActivity=overview?.recentActivity??[];
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">TUCOR Admin Console · {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
          <Activity size={13} className="text-green-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live · Updated just now
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayKpis.map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <button
              key={`admin-kpi-${kpi.label}`}
              onClick={() => onNavigate(kpi.section)}
              className="card p-4 text-left hover:shadow-card-lg transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <KpiIcon size={18} className={kpi.color} />
                </div>
                {kpi.up ? (
                  <TrendingUp size={14} className="text-green-500 opacity-70" />
                ) : (
                  <TrendingDown size={14} className="text-red-500 opacity-70" />
                )}
              </div>
              <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
              <div className={`text-xs mt-1 font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>{kpi.change}</div>
            </button>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* UCO Volume Chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Platform UCO Volume</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Collected vs Sourced (Litres)</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={displayVolume} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminSourced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: number) => [`${v.toLocaleString()} L`, '']}
              />
              <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" strokeWidth={2} fill="url(#adminCollected)" name="Collected" />
              <Area type="monotone" dataKey="sourced" stroke="#6366f1" strokeWidth={2} fill="url(#adminSourced)" name="Sourced" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Order Status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All-time distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={displayOrderStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {displayOrderStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {displayOrderStatus.map((d) => (
              <div key={`legend-${d.name}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span>{d.name}</span>
                <span className="ml-auto font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Platform Revenue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly transaction volume (₹)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={displayRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-3">
            {displayActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-2.5">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.dot}`} />
                <div>
                  <p className="text-xs text-foreground leading-relaxed">{act.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
