'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Download, Search, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import { buyerApi } from '@/lib/buyer-api';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


const statusConfig = {
  Pending: { className: 'badge-pending', icon: Clock },
  Processing: { className: 'badge-info', icon: Clock },
  Settled: { className: 'badge-active', icon: CheckCircle2 },
  Failed: { className: 'badge-danger', icon: AlertCircle },
  Disputed: { className: 'badge-danger', icon: AlertCircle },
};

export default function InvoicesSection() {
  const [search, setSearch] = useState(''); const [invoiceData,setInvoiceData]=useState<any[]>([]);useEffect(()=>{buyerApi.payments().then(ps=>setInvoiceData(ps.filter(p=>p.invoiceNumber).map(p=>({...p,description:'UCO Procurement Payment',period:(p.settledDate||p.dueDate||'').slice(0,7),type:'Procurement Invoice'})))).catch(()=>setInvoiceData([]));},[]);

  const filtered = invoiceData.filter(
    (inv) =>
      (inv.invoiceNumber||'').toLowerCase().includes(search.toLowerCase()) ||
      (inv.orderId||'').toLowerCase().includes(search.toLowerCase())
  );

  const totalSettled = invoiceData.filter((i) => i.status === 'Settled').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Download and manage your TUCOR settlement invoices
          </p>
        </div>
        <button
          onClick={() => toast.success('All invoices exported as ZIP')}
          className="btn-secondary py-2 text-xs gap-1.5"
        >
          <Download size={13} />
          Export All
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoiceData.length, sub: 'All time', color: 'text-foreground', bg: 'bg-muted', icon: FileText },
          { label: 'Settled', value: invoiceData.filter((i) => i.status === 'Settled').length, sub: `₹${totalSettled.toLocaleString('en-IN')}`, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Pending', value: invoiceData.filter((i) => ['Pending', 'Processing'].includes(i.status)).length, sub: 'Awaiting settlement', color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'This Month', value: invoiceData.filter((i) => i.period === new Date().toISOString().slice(0,7)).length, sub: new Date().toLocaleString('en-IN',{month:'short',year:'numeric'}), color: 'text-info', bg: 'bg-info-bg', icon: Receipt },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`inv-stat-${stat.label}`} className="card p-5">
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

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by invoice number or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150"
        />
      </div>

      {/* Invoice table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Invoice #', 'Order ID', 'Description', 'Period', 'Amount', 'Status', 'Due Date', ''].map((h) => (
                  <th key={`inv-col-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => {
                const cfg = statusConfig[inv.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={`inv-${inv.id}`} className="hover:bg-muted/30 transition-colors duration-100">
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs font-semibold text-foreground">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-muted-foreground">{inv.orderId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground">{inv.description}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{inv.period}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-sm font-bold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${cfg.className} text-xs flex items-center gap-1 w-fit`}>
                        <StatusIcon size={11} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{inv.dueDate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { const body=`TUCOR INVOICE\nInvoice: ${inv.invoiceNumber}\nOrder: ${inv.orderId}\nAmount: ₹${inv.amount}\nStatus: ${inv.status}\nReference: ${inv.reference||'—'}`;const blob=new Blob([body],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${inv.invoiceNumber}.txt`;a.click();URL.revokeObjectURL(url); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-150"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">No invoices found</div>
          )}
        </div>
      </div>
    </div>
  );
}
