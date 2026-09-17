'use client';

import React from 'react';
import { ArrowRight, Clock, CheckCircle2, Truck, AlertCircle, XCircle } from 'lucide-react';
import { mockOrders, Order } from '@/lib/mock-data';

// BACKEND INTEGRATION: GET /api/seller/orders?limit=5&sort=updatedAt:desc

function getOrderStatusBadge(status: Order['status']) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    Requested: { label: 'Requested', className: 'badge-muted', icon: Clock },
    'Under Review': { label: 'Under Review', className: 'badge-pending', icon: Clock },
    Matched: { label: 'Matched', className: 'badge-info', icon: CheckCircle2 },
    Confirmed: { label: 'Confirmed', className: 'badge-info', icon: CheckCircle2 },
    'Pickup Scheduled': { label: 'Pickup Scheduled', className: 'badge-pending', icon: Truck },
    'Picked Up': { label: 'Picked Up', className: 'badge-active', icon: Truck },
    Delivered: { label: 'Delivered', className: 'badge-active', icon: CheckCircle2 },
    Payment: { label: 'Payment', className: 'badge-pending', icon: Clock },
    Settled: { label: 'Settled', className: 'badge-active', icon: CheckCircle2 },
    Completed: { label: 'Completed', className: 'badge-active', icon: CheckCircle2 },
    Cancelled: { label: 'Cancelled', className: 'badge-danger', icon: XCircle },
    Rejected: { label: 'Rejected', className: 'badge-danger', icon: XCircle },
    Disputed: { label: 'Disputed', className: 'badge-danger', icon: AlertCircle },
  };
  return map[status] || { label: status, className: 'badge-muted', icon: Clock };
}

interface Props {
  onNavigate: (id: string) => void;
}

export default function RecentOrdersPanel({ onNavigate }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-bold text-foreground text-base">Recent Orders</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest order activity across all listings</p>
        </div>
        <button
          onClick={() => onNavigate('orders')}
          className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {mockOrders.map((order) => {
          const statusInfo = getOrderStatusBadge(order.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div
              key={`order-row-${order.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors duration-100 cursor-pointer"
            >
              {/* Order ID + oil type */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono-data text-xs font-semibold text-foreground">{order.id}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{order.oilType}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono-data">{order.volumeLiters} L</span>
                  <span>·</span>
                  <span>Buyer {order.buyerRef}</span>
                  {order.pickupDate && (
                    <>
                      <span>·</span>
                      <span>Pickup {order.pickupDate}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <div className="font-mono-data font-bold text-foreground text-sm">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-muted-foreground">{order.createdAt}</div>
              </div>

              {/* Status badge */}
              <div className="flex-shrink-0">
                <span className={statusInfo.className}>
                  <StatusIcon size={11} />
                  {statusInfo.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}