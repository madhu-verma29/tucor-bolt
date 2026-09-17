'use client';

import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, Download, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';


interface AdminPayment {
  id: string;
  orderId: string;
  sellerRef: string;
  buyerRef: string;
  amount: number;
  platformFee: number;
  status: 'Pending' | 'Processing' | 'Settled' | 'Failed' | 'Disputed';
  dueDate: string;
  settledDate?: string;
  reference: string;
}

const mockAdminPayments: AdminPayment[] = [
  { id: 'PAY-2026-0071', orderId: 'ORD-2026-0187', sellerRef: 'SEL-****-0038', buyerRef: 'BYR-****-7821', amount: 9610, platformFee: 481, status: 'Pending', dueDate: '2026-09-19', reference: 'TUCOR-REF-78210' },
  { id: 'PAY-2026-0065', orderId: 'ORD-2026-0162', sellerRef: 'SEL-****-0041', buyerRef: 'BYR-****-9015', amount: 6720, platformFee: 336, status: 'Processing', dueDate: '2026-09-22', reference: 'TUCOR-REF-90151' },
  { id: 'PAY-2026-0058', orderId: 'ORD-2026-0174', sellerRef: 'SEL-****-0029', buyerRef: 'BYR-****-4432', amount: 14300, platformFee: 715, status: 'Settled', dueDate: '2026-08-27', settledDate: '2026-08-26', reference: 'TUCOR-REF-44320' },
  { id: 'PAY-2026-0047', orderId: 'ORD-2026-0138', sellerRef: 'SEL-****-0029', buyerRef: 'BYR-****-6618', amount: 4400, platformFee: 220, status: 'Settled', dueDate: '2026-08-05', settledDate: '2026-08-04', reference: 'TUCOR-REF-66180' },
  { id: 'PAY-2026-0039', orderId: 'ORD-2026-0122', sellerRef: 'SEL-****-0033', buyerRef: 'BYR-****-3307', amount: 5280, platformFee: 264, status: 'Disputed', dueDate: '2026-07-28', reference: 'TUCOR-REF-33070' },
  { id: 'PAY-2026-0031', orderId: 'ORD-2026-0109', sellerRef: 'SEL-****-0021', buyerRef: 'BYR-****-4201', amount: 12870, platformFee: 644, status: 'Settled', dueDate: '2026-07-15', settledDate: '2026-07-14', reference: 'TUCOR-REF-42010' },
];

const revenueData = [
  { month: 'Apr', revenue: 284000, fees: 14200 },
  { month: 'May', revenue: 341000, fees: 17050 },
  { month: 'Jun', revenue: 298000, fees: 14900 },
  { month: 'Jul', revenue: 412000, fees: 20600 },
  { month: 'Aug', revenue: 489000, fees: 24450 },
  { month: 'Sep', revenue: 451000, fees: 22550 },
];

const statusConfig = {
  Pending: { className: 'badge-pending', icon: Clock },
  Processing: { className: 'badge-info', icon: Clock },
  Settled: { className: 'badge-active', icon: CheckCircle2 },
  Failed: { className: 'badge-danger', icon: AlertCircle },
  Disputed: { className: 'badge-danger', icon: AlertCircle },
};

export default function AdminPaymentsSection() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | AdminPayment['status']>('all');

  const filtered = mockAdminPayments.filter((p) => {
    const matchSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.orderId.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const totalSettled = mockAdminPayments.filter((p) => p.status === 'Settled').reduce((s, p) => s + p.amount, 0);
  const totalFees = mockAdminPayments.filter((p) => p.status === 'Settled').reduce((s, p) => s + p.platformFee, 0);
  const totalPending = mockAdminPayments.filter((p) => ['Pending', 'Processing'].includes(p.status)).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin Console · Monitor all platform payments and settlements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Settled', value: `₹${(totalSettled / 1000).toFixed(1)}K`, sub: `${mockAdminPayments.filter((p) => p.status === 'Settled').length} payments`, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Platform Fees', value: `₹${totalFees.toLocaleString('en-IN')}`, sub: '5% per transaction', color: 'text-primary', bg: 'bg-primary/10', icon: DollarSign },
          { label: 'Awaiting Settlement', value: `₹${(totalPending / 1000).toFixed(1)}K`, sub: `${mockAdminPayments.filter((p) => ['Pending', 'Processing'].includes(p.status)).length} pending`, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'Disputed', value: mockAdminPayments.filter((p) => p.status === 'Disputed').length, sub: 'Needs resolution', color: 'text-danger', bg: 'bg-danger-bg', icon: AlertCircle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`admin-pay-stat-${stat.label}`} className="card p-5">
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

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-sm">Platform Revenue & Fees (6 months)</h3>
          <button onClick={() => toast.success('Revenue report exported')} className="btn-secondary py-1.5 text-xs gap-1.5">
            <Download size={12} />
            Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
            <Tooltip formatter={(v: number, name: string) => [`₹${v.toLocaleString('en-IN')}`, name === 'revenue' ? 'GMV' : 'Platform Fees']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revGrad)" />
            <Area type="monotone" dataKey="fees" stroke="var(--chart-2)" strokeWidth={2} fill="url(#feeGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'Pending', 'Processing', 'Settled', 'Disputed'] as const).map((s) => (
            <button
              key={`admin-pay-filter-${s}`}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Payment ID', 'Order ID', 'Seller', 'Buyer', 'Amount', 'Platform Fee', 'Status', 'Due Date', 'Actions'].map((h) => (
                  <th key={`admin-pay-col-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((payment) => {
                const cfg = statusConfig[payment.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={`admin-pay-${payment.id}`} className="hover:bg-muted/30 transition-colors duration-100">
                    <td className="px-4 py-3"><span className="font-mono-data text-xs font-semibold text-foreground">{payment.id}</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-xs text-muted-foreground">{payment.orderId}</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-xs text-muted-foreground">{payment.sellerRef}</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-xs text-muted-foreground">{payment.buyerRef}</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-sm font-bold text-foreground">₹{payment.amount.toLocaleString('en-IN')}</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-xs text-primary">₹{payment.platformFee.toLocaleString('en-IN')}</span></td>
                    <td className="px-4 py-3">
                      <span className={`${cfg.className} text-xs flex items-center gap-1 w-fit`}>
                        <StatusIcon size={11} />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{payment.settledDate || payment.dueDate}</span></td>
                    <td className="px-4 py-3">
                      {payment.status === 'Pending' && (
                        <button onClick={() => toast.success(`Processing payment ${payment.id}`)} className="text-xs text-primary hover:underline">
                          Process
                        </button>
                      )}
                      {payment.status === 'Disputed' && (
                        <button onClick={() => toast.info(`Opening dispute for ${payment.id}`)} className="text-xs text-danger hover:underline">
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">No payments found</div>
          )}
        </div>
      </div>
    </div>
  );
}
