'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Truck, MapPin, Calendar, Package, ChevronDown, Phone, MessageSquare, ShieldCheck, Search, ArrowUpDown, FileText, AlertCircle, CircleDot,  } from 'lucide-react';
import type { BuyerOrder } from '@/lib/buyer-api';
import { buyerApi } from '@/lib/buyer-api';

// BACKEND INTEGRATION: GET /api/buyer/orders — returns all orders for authenticated buyer

const ORDER_TIMELINE_STEPS: { key: BuyerOrder['status']; label: string; description: string }[] = [
  { key: 'Requested', label: 'Requested', description: 'Order submitted to TUCOR' },
  { key: 'Under Review', label: 'Under Review', description: 'TUCOR reviewing your request' },
  { key: 'Matched', label: 'Matched', description: 'Matched with a verified seller' },
  { key: 'Confirmed', label: 'Confirmed', description: 'Order confirmed by both parties' },
  { key: 'Pickup Scheduled', label: 'Pickup Scheduled', description: 'Pickup date assigned by TUCOR' },
  { key: 'Picked Up', label: 'Picked Up', description: 'UCO collected from seller' },
  { key: 'Delivered', label: 'Delivered', description: 'Delivered to your facility' },
  { key: 'Payment', label: 'Payment', description: 'Payment processing in progress' },
  { key: 'Settled', label: 'Settled', description: 'Payment settled successfully' },
  { key: 'Completed', label: 'Completed', description: 'Order fully completed' },
];

const TERMINAL_STATUSES = ['Cancelled', 'Rejected', 'Disputed'];
const ACTIVE_STATUSES = ['Requested', 'Under Review', 'Matched', 'Confirmed', 'Pickup Scheduled', 'Picked Up', 'Delivered', 'Payment'];

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

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

function OrderTimeline({ status }: { status: BuyerOrder['status'] }) {
  if (TERMINAL_STATUSES.includes(status)) {
    const iconMap: Record<string, React.ReactNode> = {
      Cancelled: <XCircle size={14} className="text-danger" />,
      Rejected: <XCircle size={14} className="text-danger" />,
      Disputed: <AlertCircle size={14} className="text-amber-500" />,
    };
    const msgMap: Record<string, string> = {
      Cancelled: 'This order was cancelled.',
      Rejected: 'This order was rejected by TUCOR.',
      Disputed: 'This order is under dispute review.',
    };
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/5 border border-danger/20">
        {iconMap[status]}
        <span className="text-sm font-semibold text-foreground">{status}</span>
        <span className="text-xs text-muted-foreground">— {msgMap[status]}</span>
      </div>
    );
  }

  const currentIdx = ORDER_TIMELINE_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="w-full">
      {/* Horizontal scrollable timeline */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex items-start min-w-max gap-0">
          {ORDER_TIMELINE_STEPS.map((step, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <React.Fragment key={`timeline-step-${step.key}`}>
                <div className="flex flex-col items-center gap-1.5 w-20">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200 ${
                      isDone
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-1' :'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={13} /> : isCurrent ? <CircleDot size={13} /> : i + 1}
                  </div>
                  <span
                    className={`text-center leading-tight text-xs px-0.5 ${
                      isCurrent ? 'text-primary font-semibold' : isDone ? 'text-success' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < ORDER_TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-5 flex-shrink-0 mt-3.5 transition-colors duration-200 ${
                      i < currentIdx ? 'bg-success' : 'bg-border'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* Current step description */}
      {currentIdx >= 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
          <CircleDot size={12} />
          <span className="font-medium">Current: </span>
          <span>{ORDER_TIMELINE_STEPS[currentIdx]?.description}</span>
        </div>
      )}
    </div>
  );
}

function TUCORContactCard() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={15} className="text-primary" />
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">TUCOR Order Support</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        All seller communications are handled exclusively by TUCOR. Seller identity is kept confidential to ensure a fair, secure marketplace.
      </p>
      <div className="flex flex-col gap-2">
        <a
          href="tel:+918001234567"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors duration-150 text-sm font-medium text-foreground"
        >
          <Phone size={14} className="text-primary flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold">+91 800 123 4567</div>
            <div className="text-xs text-muted-foreground">Mon–Sat, 9 AM – 6 PM</div>
          </div>
        </a>
        <a
          href="mailto:orders@tucor.in"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors duration-150 text-sm font-medium text-foreground"
        >
          <MessageSquare size={14} className="text-primary flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold">orders@tucor.in</div>
            <div className="text-xs text-muted-foreground">Response within 4 hours</div>
          </div>
        </a>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: BuyerOrder }) {
  const [expanded, setExpanded] = useState(false);
  const isTerminal = TERMINAL_STATUSES.includes(order.status);
  const isCompleted = order.status === 'Completed' || order.status === 'Settled';

  return (
    <div className="card overflow-hidden">
      {/* Card Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-100 text-left"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isTerminal
              ? 'bg-danger/10'
              : isCompleted
              ? 'bg-success/10' :'bg-primary/10'
          }`}
        >
          {isTerminal ? (
            <XCircle size={18} className="text-danger" />
          ) : isCompleted ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <Truck size={18} className="text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{order.oilType} Oil</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${gradeColors[order.gradeLabel]}`}>
              Grade {order.gradeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {order.city}
            </span>
            <span className="flex items-center gap-1">
              <Package size={10} />
              {order.volumeLiters} L
            </span>
            {order.pickupDate && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                Pickup: {order.pickupDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={10} />
              Created: {order.createdAt}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="font-mono font-bold text-foreground text-sm">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground">Updated {order.updatedAt}</div>
          </div>
          <span className={`${statusColors[order.status] || 'badge-muted'} flex-shrink-0`}>{order.status}</span>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-border px-5 py-5 space-y-5 animate-fade-in-up">
          {/* Timeline */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Order Journey
            </div>
            <OrderTimeline status={order.status} />
          </div>

          {/* Order Details Grid */}
          <div className="pt-4 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Order Details
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Listing ID', value: order.listingId, icon: <FileText size={11} /> },
                { label: 'Oil Type', value: `${order.oilType} (Grade ${order.gradeLabel})`, icon: <Package size={11} /> },
                { label: 'Volume', value: `${order.volumeLiters} L`, icon: <Package size={11} /> },
                { label: 'Rate', value: `₹${order.pricePerLiter}/L`, icon: null },
                { label: 'Total Amount', value: `₹${order.totalAmount.toLocaleString('en-IN')}`, icon: null },
                { label: 'Location', value: order.city, icon: <MapPin size={11} /> },
                { label: 'Order Created', value: order.createdAt, icon: <Calendar size={11} /> },
                { label: 'Last Updated', value: order.updatedAt, icon: <Clock size={11} /> },
                ...(order.pickupDate
                  ? [{ label: 'Pickup Date', value: order.pickupDate, icon: <Truck size={11} /> }]
                  : []),
                ...(order.deliveryDate
                  ? [{ label: 'Delivery Date', value: order.deliveryDate, icon: <CheckCircle2 size={11} /> }]
                  : []),
                ...(order.paymentDue
                  ? [{ label: 'Payment Due', value: order.paymentDue, icon: <Calendar size={11} /> }]
                  : []),
                ...(order.invoiceNumber
                  ? [{ label: 'Invoice', value: order.invoiceNumber, icon: <FileText size={11} /> }]
                  : []),
              ].map((detail) => (
                <div key={`order-detail-${detail.label}`}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    {detail.icon}
                    {detail.label}
                  </div>
                  <div className="font-mono text-sm font-semibold text-foreground">{detail.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Date Highlight (if scheduled) */}
          {order.pickupDate && ACTIVE_STATUSES.includes(order.status) && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Scheduled Pickup Date</div>
                <div className="font-semibold text-foreground text-sm">{order.pickupDate}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  TUCOR logistics team will coordinate pickup from the seller
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Notes: </span>
              {order.notes}
            </div>
          )}

          {/* TUCOR Contact */}
          <div className="pt-1">
            <TUCORContactCard />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuyerOrdersTrackingSection() {
  const [apiOrders,setApiOrders]=useState<BuyerOrder[]>([]);
  useEffect(()=>{buyerApi.orders().then(setApiOrders).catch(()=>setApiOrders([]));},[]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  const allOrders = [...apiOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortDesc ? dateB - dateA : dateA - dateB;
  });

  const filteredOrders = allOrders.filter((order) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'active'
        ? ACTIVE_STATUSES.includes(order.status)
        : activeTab === 'completed'
        ? order.status === 'Completed' || order.status === 'Settled'
        : TERMINAL_STATUSES.includes(order.status);

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.oilType.toLowerCase().includes(q) ||
      order.city.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const counts = {
    all: allOrders.length,
    active: allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    completed: allOrders.filter((o) => o.status === 'Completed' || o.status === 'Settled').length,
    cancelled: allOrders.filter((o) => TERMINAL_STATUSES.includes(o.status)).length,
  };

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Orders', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled / Rejected', count: counts.cancelled },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track all your UCO procurement orders — status, pickup dates, and full journey timeline
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Managed by TUCOR
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: counts.all, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Active', value: counts.active, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Completed', value: counts.completed, color: 'text-success', bg: 'bg-success/5' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-danger', bg: 'bg-danger/5' },
        ].map((kpi) => (
          <div key={`orders-kpi-${kpi.label}`} className={`card px-4 py-3 ${kpi.bg}`}>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search + Sort */}
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-0.5">
          {tabs.map((tab) => (
            <button
              key={`orders-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID, oil type, city, or status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={() => setSortDesc((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 flex-shrink-0"
          >
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">{sortDesc ? 'Newest first' : 'Oldest first'}</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <div className="font-semibold text-foreground mb-1">No orders found</div>
          <div className="text-sm text-muted-foreground">
            {searchQuery ? 'Try a different search term' : 'Your orders will appear here once created'}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <OrderCard key={`buyer-order-card-${order.id}`} order={order} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <ShieldCheck size={12} className="text-success flex-shrink-0" />
        <span>
          Seller identities are kept confidential. All coordination, logistics, and communications are managed by TUCOR.
        </span>
      </div>
    </div>
  );
}
