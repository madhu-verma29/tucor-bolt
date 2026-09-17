'use client';

import React, { useState } from 'react';
import { ChevronDown, Clock, CheckCircle2, Truck, AlertCircle, XCircle } from 'lucide-react';
import { mockOrders, Order } from '@/lib/mock-data';

// BACKEND INTEGRATION: GET /api/seller/orders

const ORDER_TIMELINE_STEPS = [
  'Requested',
  'Under Review',
  'Matched',
  'Confirmed',
  'Pickup Scheduled',
  'Picked Up',
  'Delivered',
  'Payment',
  'Settled',
  'Completed',
];

function OrderStatusTimeline({ status }: { status: Order['status'] }) {
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
          <React.Fragment key={`timeline-${step}`}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isDone
                    ? 'bg-success text-white'
                    : isCurrent
                    ? 'bg-primary text-white ring-2 ring-primary/30' :'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span
                className={`text-xs text-center leading-tight w-16 ${
                  isCurrent ? 'text-primary font-semibold' : isDone ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>
            {i < ORDER_TIMELINE_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-6 flex-shrink-0 mb-5 transition-colors duration-200 ${
                  i < currentIdx ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function getStatusIcon(status: Order['status']) {
  if (['Completed', 'Settled', 'Delivered', 'Picked Up'].includes(status)) return CheckCircle2;
  if (['Pickup Scheduled', 'Picked Up'].includes(status)) return Truck;
  if (['Cancelled', 'Rejected'].includes(status)) return XCircle;
  if (status === 'Disputed') return AlertCircle;
  return Clock;
}

export default function OrdersSection() {
  const [expandedId, setExpandedId] = useState<string | null>('ORD-2026-0187');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockOrders.length} orders · {mockOrders.filter((o) => ['Requested', 'Under Review', 'Confirmed'].includes(o.status)).length} active
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {mockOrders.map((order) => {
          const isExpanded = expandedId === order.id;
          const StatusIcon = getStatusIcon(order.status);
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

          return (
            <div key={`order-card-${order.id}`} className="card overflow-hidden">
              {/* Order header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-100 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <StatusIcon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono-data text-sm font-bold text-foreground">{order.id}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{order.oilType} Oil</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="font-mono-data text-xs text-muted-foreground">{order.volumeLiters} L</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Buyer {order.buyerRef}</span>
                    {order.pickupDate && <span>· Pickup {order.pickupDate}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="font-mono-data font-bold text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-muted-foreground">{order.createdAt}</div>
                  </div>
                  <span className={`${statusColors[order.status] || 'badge-muted'} flex-shrink-0`}>{order.status}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Expanded timeline */}
              {isExpanded && (
                <div className="border-t border-border px-5 py-5 animate-fade-in-up">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    Order Journey
                  </div>
                  <OrderStatusTimeline status={order.status} />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
                    {[
                      { label: 'Listing ID', value: order.listingId },
                      { label: 'Volume', value: `${order.volumeLiters} L` },
                      { label: 'Total Amount', value: `₹${order.totalAmount.toLocaleString('en-IN')}` },
                      { label: 'Buyer Ref', value: order.buyerRef },
                      { label: 'Created', value: order.createdAt },
                      { label: 'Last Updated', value: order.updatedAt },
                      ...(order.pickupDate ? [{ label: 'Pickup Date', value: order.pickupDate }] : []),
                      ...(order.paymentDue ? [{ label: 'Payment Due', value: order.paymentDue }] : []),
                    ].map((detail) => (
                      <div key={`order-detail-${detail.label}`}>
                        <div className="text-xs text-muted-foreground mb-1">{detail.label}</div>
                        <div className="font-mono-data text-sm font-semibold text-foreground">{detail.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}