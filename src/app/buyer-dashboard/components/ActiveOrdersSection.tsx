'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Truck, XCircle, MapPin, Calendar, Package } from 'lucide-react';
import { mockBuyerOrders, BuyerOrder } from '@/lib/buyer-mock-data';

// BACKEND INTEGRATION: GET /api/buyer/orders?status=active

const ORDER_TIMELINE_STEPS = [
  'Requested', 'Under Review', 'Matched', 'Confirmed',
  'Pickup Scheduled', 'Picked Up', 'Delivered', 'Payment', 'Settled', 'Completed',
];

const ACTIVE_STATUSES = ['Requested', 'Under Review', 'Matched', 'Confirmed', 'Pickup Scheduled', 'Picked Up', 'Delivered', 'Payment'];

function OrderStatusTimeline({ status }: { status: BuyerOrder['status'] }) {
  const terminalStatuses = ['Cancelled', 'Rejected', 'Disputed'];
  if (terminalStatuses.includes(status)) {
    return (
      <div className="flex items-center gap-2 text-xs text-danger">
        <XCircle size={14} />
        <span className="font-semibold">{status}</span>
      </div>
    );
  }
  const currentIdx = ORDER_TIMELINE_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin py-2">
      {ORDER_TIMELINE_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <React.Fragment key={`buyer-timeline-${step}`}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${isDone ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'}`}>
                {isDone ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span className={`text-xs text-center leading-tight w-16 ${isCurrent ? 'text-primary font-semibold' : isDone ? 'text-success' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
            {i < ORDER_TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 w-6 flex-shrink-0 mb-5 transition-colors duration-200 ${i < currentIdx ? 'bg-success' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const statusColors: Record<string, string> = {
  Requested: 'badge-muted',
  'Under Review': 'badge-pending',
  Matched: 'badge-info',
  Confirmed: 'badge-info',
  'Pickup Scheduled': 'badge-pending',
  'Picked Up': 'badge-active',
  Delivered: 'badge-active',
  Payment: 'badge-pending',
  Settled: 'badge-active',
  Completed: 'badge-active',
  Cancelled: 'badge-danger',
  Rejected: 'badge-danger',
  Disputed: 'badge-danger',
};

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  C: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ActiveOrdersSection() {
  const [expandedId, setExpandedId] = useState<string | null>('ORD-2026-0201');

  const activeOrders = mockBuyerOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Active Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''} in progress
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          All managed by TUCOR
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <div className="font-semibold text-foreground mb-1">No active orders</div>
          <div className="text-sm text-muted-foreground">Your active procurement orders will appear here</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={`active-order-${order.id}`} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-100 text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Truck size={16} className="text-primary" />
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
                      {order.pickupDate && <span className="flex items-center gap-1"><Calendar size={10} />Pickup {order.pickupDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="font-mono-data font-bold text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">{order.createdAt}</div>
                    </div>
                    <span className={`${statusColors[order.status] || 'badge-muted'} flex-shrink-0`}>{order.status}</span>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-5 animate-fade-in-up">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Order Journey</div>
                    <OrderStatusTimeline status={order.status} />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
                      {[
                        { label: 'Listing ID', value: order.listingId },
                        { label: 'Volume', value: `${order.volumeLiters} L` },
                        { label: 'Rate', value: `₹${order.pricePerLiter}/L` },
                        { label: 'Total Amount', value: `₹${order.totalAmount.toLocaleString('en-IN')}` },
                        { label: 'Seller Ref', value: order.sellerRef },
                        { label: 'Created', value: order.createdAt },
                        ...(order.pickupDate ? [{ label: 'Pickup Date', value: order.pickupDate }] : []),
                        ...(order.paymentDue ? [{ label: 'Payment Due', value: order.paymentDue }] : []),
                      ].map((detail) => (
                        <div key={`active-order-detail-${detail.label}`}>
                          <div className="text-xs text-muted-foreground mb-1">{detail.label}</div>
                          <div className="font-mono-data text-sm font-semibold text-foreground">{detail.value}</div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Notes: </span>{order.notes}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-success" />
                      <span>Seller identity is confidential — all communications through TUCOR</span>
                    </div>
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
