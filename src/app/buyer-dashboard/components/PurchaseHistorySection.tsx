'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, CheckCircle2, XCircle, Download, Search, Calendar, MapPin, Package } from 'lucide-react';
import type { BuyerOrder, BuyerPayment } from '@/lib/buyer-api';
import { buyerApi } from '@/lib/buyer-api';

// BACKEND INTEGRATION: GET /api/buyer/orders?status=completed,settled,cancelled,rejected

const HISTORY_STATUSES = ['Completed', 'Settled', 'Cancelled', 'Rejected', 'Disputed'];

const statusColors: Record<string, string> = {
  Completed: 'badge-active',
  Settled: 'badge-active',
  Cancelled: 'badge-danger',
  Rejected: 'badge-danger',
  Disputed: 'badge-danger',
};

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  C: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function PurchaseHistorySection() {
  const [apiOrders,setApiOrders]=useState<BuyerOrder[]>([]); const [payments,setPayments]=useState<BuyerPayment[]>([]);useEffect(()=>{Promise.all([buyerApi.orders(),buyerApi.payments()]).then(([o,p])=>{setApiOrders(o);setPayments(p)}).catch(()=>{setApiOrders([]);setPayments([])});},[]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const historyOrders = apiOrders.filter((o) => HISTORY_STATUSES.includes(o.status));

  const filtered = historyOrders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.oilType.toLowerCase().includes(q) && !o.city.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalSpend = historyOrders
    .filter((o) => ['Completed', 'Settled'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalVolume = historyOrders
    .filter((o) => ['Completed', 'Settled'].includes(o.status))
    .reduce((sum, o) => sum + o.volumeLiters, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Purchase History</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {historyOrders.length} completed transactions
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: historyOrders.filter((o) => ['Completed', 'Settled'].includes(o.status)).length.toString(), sub: 'completed' },
          { label: 'Total UCO Sourced', value: `${totalVolume.toLocaleString('en-IN')} L`, sub: 'volume procured' },
          { label: 'Total Spend', value: `₹${totalSpend.toLocaleString('en-IN')}`, sub: 'settled payments' },
          { label: 'Avg. Price/Liter', value: totalVolume > 0 ? `₹${(totalSpend / totalVolume).toFixed(1)}` : '—', sub: 'blended rate' },
        ].map((stat) => (
          <div key={`history-stat-${stat.label}`} className="card p-4">
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-xl font-extrabold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border focus-within:border-ring transition-colors duration-150">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by order ID, oil type, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Completed', 'Settled', 'Cancelled'].map((s) => (
            <button
              key={`history-filter-${s}`}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="text-xs text-muted-foreground">
        {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        {filterStatus !== 'all' || searchQuery ? ' (filtered)' : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-semibold text-foreground mb-1">No records found</div>
          <div className="text-sm text-muted-foreground">Try adjusting your filters</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const payment = payments.find((p) => p.orderId === order.id);
            const isCompleted = ['Completed', 'Settled'].includes(order.status);

            return (
              <div key={`history-order-${order.id}`} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-100 text-left"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-success/10' : 'bg-danger/10'}`}>
                    {isCompleted ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-danger" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono-data text-sm font-bold text-foreground">{order.id}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{order.oilType} Oil</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${gradeColors[order.gradeLabel]}`}>Grade {order.gradeLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={10} />{order.city}</span>
                      <span className="flex items-center gap-1"><Package size={10} />{order.volumeLiters} L</span>
                      <span className="flex items-center gap-1"><Calendar size={10} />{order.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className={`font-mono-data font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      {payment?.settledDate && (
                        <div className="text-xs text-success">Settled {payment.settledDate}</div>
                      )}
                    </div>
                    <span className={`${statusColors[order.status] || 'badge-muted'} flex-shrink-0`}>{order.status}</span>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-5 animate-fade-in-up">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'Listing ID', value: order.listingId },
                        { label: 'Volume', value: `${order.volumeLiters} L` },
                        { label: 'Rate', value: `₹${order.pricePerLiter}/L` },
                        { label: 'Total Amount', value: `₹${order.totalAmount.toLocaleString('en-IN')}` },
                        { label: 'Seller Ref', value: order.sellerRef },
                        { label: 'Order Date', value: order.createdAt },
                        ...(order.pickupDate ? [{ label: 'Pickup Date', value: order.pickupDate }] : []),
                        ...(order.deliveryDate ? [{ label: 'Delivery Date', value: order.deliveryDate }] : []),
                      ].map((detail) => (
                        <div key={`history-detail-${detail.label}`}>
                          <div className="text-xs text-muted-foreground mb-1">{detail.label}</div>
                          <div className="font-mono-data text-sm font-semibold text-foreground">{detail.value}</div>
                        </div>
                      ))}
                    </div>

                    {payment && (
                      <div className="pt-4 border-t border-border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment Details</div>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex gap-4 flex-wrap">
                            {[
                              { label: 'Invoice', value: payment.invoiceNumber },
                              { label: 'Reference', value: payment.reference },
                              { label: 'Status', value: payment.status },
                              ...(payment.settledDate ? [{ label: 'Settled On', value: payment.settledDate }] : []),
                            ].map((p) => (
                              <div key={`payment-detail-${p.label}`}>
                                <div className="text-xs text-muted-foreground">{p.label}</div>
                                <div className="font-mono-data text-xs font-semibold text-foreground">{p.value}</div>
                              </div>
                            ))}
                          </div>
                          {order.invoiceNumber && (
                            <button className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                              <Download size={12} />
                              Download Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Notes: </span>{order.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
