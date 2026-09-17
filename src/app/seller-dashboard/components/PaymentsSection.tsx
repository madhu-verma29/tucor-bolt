'use client';

import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { mockPayments, Payment } from '@/lib/mock-data';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


// BACKEND INTEGRATION: GET /api/seller/payments

function getPaymentStatusConfig(status: Payment['status']) {
  const map = {
    Pending: { className: 'badge-pending', icon: Clock, color: 'text-warning' },
    Processing: { className: 'badge-info', icon: Clock, color: 'text-info' },
    Settled: { className: 'badge-active', icon: CheckCircle2, color: 'text-success' },
    Failed: { className: 'badge-danger', icon: AlertCircle, color: 'text-danger' },
    Disputed: { className: 'badge-danger', icon: AlertCircle, color: 'text-danger' },
  };
  return map[status] || map.Pending;
}

export default function PaymentsSection() {
  const totalEarned = mockPayments.filter((p) => p.status === 'Settled').reduce((s, p) => s + p.amount, 0);
  const totalPending = mockPayments.filter((p) => ['Pending', 'Processing'].includes(p.status)).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All TUCOR settlement payments for your UCO collections</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned (Lifetime)', value: `₹${(278400).toLocaleString('en-IN')}`, sub: '67 collections', color: 'text-success', bg: 'bg-success-bg', icon: TrendingUp },
          { label: 'Settled This Month', value: `₹${totalEarned.toLocaleString('en-IN')}`, sub: `${mockPayments.filter((p) => p.status === 'Settled').length} payments`, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Awaiting Settlement', value: `₹${totalPending.toLocaleString('en-IN')}`, sub: `${mockPayments.filter((p) => ['Pending', 'Processing'].includes(p.status)).length} pending`, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'Avg. Per Collection', value: '₹4,155', sub: 'Based on last 12 months', color: 'text-info', bg: 'bg-info-bg', icon: CreditCard },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`pay-stat-${stat.label}`} className="card p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className={`font-mono-data text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Payment table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base">Payment History</h3>
          <button
            onClick={() => toast.success('Payment report exported')}
            className="btn-secondary py-2 text-xs gap-1.5"
          >
            <Download size={13} />
            Export
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Invoice', 'Order ID', 'Amount', 'Status', 'Due Date', 'Settled Date', 'Reference', ''].map((h) => (
                  <th key={`pay-col-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockPayments.map((payment) => {
                const config = getPaymentStatusConfig(payment.status);
                const StatusIcon = config.icon;
                return (
                  <tr key={`pay-row-${payment.id}`} className="hover:bg-muted/40 transition-colors duration-100 group">
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs font-semibold text-foreground">{payment.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-muted-foreground">{payment.orderId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono-data font-bold text-sm ${config.color}`}>
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={config.className}>
                        <StatusIcon size={11} />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{payment.dueDate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{payment.settledDate || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-muted-foreground">{payment.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toast.success(`Invoice ${payment.invoiceNumber} downloaded`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Download invoice"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}