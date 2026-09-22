'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { adminApi, type AdminOrder } from '@/lib/admin-api';
import { toast } from 'sonner';

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  'Requested': { color: 'bg-muted text-muted-foreground border-border', icon: Clock },
  'Under Review': { color: 'bg-blue-500/15 text-blue-600 border-blue-500/30', icon: Eye },
  'Matched': { color: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30', icon: CheckCircle },
  'Confirmed': { color: 'bg-primary/15 text-primary border-primary/30', icon: CheckCircle },
  'Pickup Scheduled': { color: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30', icon: Truck },
  'Picked Up': { color: 'bg-teal-500/15 text-teal-600 border-teal-500/30', icon: Truck },
  'Delivered': { color: 'bg-green-500/15 text-green-600 border-green-500/30', icon: Package },
  'Payment': { color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: Clock },
  'Payment Pending': { color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: Clock },
  'Settled': { color: 'bg-green-500/15 text-green-600 border-green-500/30', icon: CheckCircle },
  'Completed': { color: 'bg-green-500/15 text-green-600 border-green-500/30', icon: CheckCircle },
  'Cancelled': { color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
  'Rejected': { color: 'bg-red-500/15 text-red-600 border-red-500/30', icon: XCircle },
  'Disputed': { color: 'bg-red-500/15 text-red-600 border-red-500/30', icon: AlertTriangle },
};

const orderJourneySteps = [
  'Requested', 'Under Review', 'Matched', 'Confirmed',
  'Pickup Scheduled', 'Picked Up', 'Delivered', 'Payment', 'Payment Pending', 'Settled', 'Completed'
];

export default function AdminOrdersSection() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [adminOrders,setAdminOrders]=useState<AdminOrder[]>([]);
  useEffect(()=>{adminApi.orders().then(setAdminOrders).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load orders'));},[]);

  const filtered = adminOrders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.seller.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStepIndex = (status: string) => orderJourneySteps.indexOf(status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{adminOrders.length} total orders · {adminOrders.filter((o) => o.status === 'Disputed').length} disputed</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {['Under Review', 'Disputed'].map((s) => {
            const count = adminOrders.filter((o) => o.status === s).length;
            return count > 0 ? (
              <div key={s} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold ${statusConfig[s]?.color}`}>
                {s}: {count}
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search order ID, seller, buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full text-sm"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Status</option>
          {Object.keys(statusConfig).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} card overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Parties</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const cfg = statusConfig[order.status];
                  const StatusIcon = cfg?.icon || Clock;
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 cursor-pointer ${selected?.id === order.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelected(order)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-foreground">{order.id}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{order.oilType} · {order.volumeLiters}L</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-foreground">{order.seller}</div>
                        <div className="text-xs text-muted-foreground">→ {order.buyer}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium inline-flex items-center gap-1 ${cfg?.color}`}>
                          <StatusIcon size={10} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground hidden lg:table-cell">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-100">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No orders match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">Order Detail</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-foreground">{selected.id}</div>
              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium mt-1.5 inline-block ${statusConfig[selected.status]?.color}`}>{selected.status}</span>
            </div>

            {/* Order Journey */}
            {!['Cancelled', 'Rejected', 'Disputed'].includes(selected.status) && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Journey</h4>
                <div className="flex flex-col gap-1">
                  {orderJourneySteps.map((step, idx) => {
                    const currentIdx = getStepIndex(selected.status);
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={`journey-${step}`} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs ${isCurrent ? 'text-foreground font-semibold' : isDone ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-xs">
              {[
                { label: 'Seller', value: selected.seller },
                { label: 'Buyer', value: selected.buyer },
                { label: 'Oil Type', value: selected.oilType },
                { label: 'Volume', value: `${selected.volumeLiters} L` },
                { label: 'Amount', value: `₹${selected.totalAmount.toLocaleString()}` },
                { label: 'Route', value: selected.location },
                { label: 'Created', value: selected.createdAt },
                { label: 'Updated', value: selected.updatedAt },
              ].map((item) => (
                <div key={`order-detail-${item.label}`} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
