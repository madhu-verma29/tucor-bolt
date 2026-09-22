'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, Package, Bookmark, ShoppingCart, Search, History, TrendingUp, ArrowRight, MapPin, Droplets, CheckCircle2, Clock, Truck, AlertCircle, X, ChevronRight,  } from 'lucide-react';
import type { BuyerOrder, UCOMarketListing } from '@/lib/buyer-api';
import { buyerApi, BuyerProfile } from '@/lib/buyer-api';

interface Props {
  onNavigate: (id: string) => void;
}

const ACTIVE_STATUSES = ['Requested', 'Under Review', 'Matched', 'Confirmed', 'Pickup Scheduled', 'Picked Up', 'Delivered', 'Payment', 'Payment Pending'];
const PENDING_STATUSES = ['Requested', 'Under Review', 'Matched'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Requested:        { label: 'Requested',        color: 'text-slate-600 dark:text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',          icon: ClipboardList },
  'Under Review':   { label: 'Under Review',      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/30',        icon: Clock },
  Matched:          { label: 'Matched',           color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/30',          icon: CheckCircle2 },
  Confirmed:        { label: 'Confirmed',         color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30',      icon: CheckCircle2 },
  'Pickup Scheduled': { label: 'Pickup Scheduled', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30',    icon: Truck },
  'Picked Up':      { label: 'Picked Up',         color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-100 dark:bg-teal-900/30',          icon: Truck },
  Delivered:        { label: 'Delivered',         color: 'text-success',                         bg: 'bg-success/10',                            icon: CheckCircle2 },
  Payment:          { label: 'Awaiting Payment',  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30',      icon: AlertCircle },
  'Payment Pending': { label: 'Payment Pending',   color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30',      icon: AlertCircle },
  Completed:        { label: 'Completed',         color: 'text-success',                         bg: 'bg-success/10',                            icon: CheckCircle2 },
  Settled:          { label: 'Settled',           color: 'text-success',                         bg: 'bg-success/10',                            icon: CheckCircle2 },
  Cancelled:        { label: 'Cancelled',         color: 'text-destructive',                     bg: 'bg-destructive/10',                        icon: X },
};

const GRADE_COLORS: Record<string, string> = {
  A: 'text-success bg-success/10',
  B: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  C: 'text-destructive bg-destructive/10',
};

// Simulated saved listings (pinned from browse)
const SAVED_LISTING_IDS: string[] = [];

export default function BuyerHomeSection({ onNavigate }: Props) {
  const [savedIds, setSavedIds] = useState<string[]>(SAVED_LISTING_IDS);
  const [orders,setOrders]=useState<BuyerOrder[]>([]);const [listings,setListings]=useState<UCOMarketListing[]>([]);const [profile,setProfile]=useState<BuyerProfile|null>(null);
  useEffect(()=>{Promise.all([buyerApi.orders(),buyerApi.listings(),buyerApi.profile(),buyerApi.savedListings()]).then(([o,l,p,s])=>{setOrders(o);setListings(l);setProfile(p);setSavedIds(s)}).catch(()=>{});},[]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pendingOrders = orders.filter((o) => PENDING_STATUSES.includes(o.status));
  const savedListings = listings.filter((l) => savedIds.includes(l.id));
  const recentSaved = listings.filter((l) => savedIds.includes(l.id)).slice(0, 3);

  const totalPendingValue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const kpis = [
    {
      id: 'active-requests',
      label: 'Active Requests',
      value: pendingOrders.length.toString(),
      sub: `₹${(totalPendingValue / 1000).toFixed(0)}K pending value`,
      icon: ClipboardList,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      action: 'orders',
      trend: '+1 this week',
      trendUp: true,
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: activeOrders.length.toString(),
      sub: `${activeOrders.filter(o => o.status === 'Pickup Scheduled').length} pickup scheduled`,
      icon: Package,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      action: 'orders',
      trend: 'On track',
      trendUp: true,
    },
    {
      id: 'saved-listings',
      label: 'Saved Listings',
      value: savedIds.length.toString(),
      sub: `${savedListings.filter(l => l.status === 'Available').length} still available`,
      icon: Bookmark,
      color: 'text-primary',
      bg: 'bg-primary/10',
      action: 'home',
      trend: `${savedListings.filter(l => l.status === 'Limited').length} limited stock`,
      trendUp: false,
    },
  ];

  const quickActions = [
    {
      id: 'browse',
      label: 'Browse Listings',
      desc: 'Explore verified UCO offerings',
      icon: Search,
      color: 'text-primary',
      bg: 'bg-primary/10',
      action: 'listings',
    },
    {
      id: 'orders',
      label: 'Track Orders',
      desc: 'Monitor active procurement',
      icon: ShoppingCart,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      action: 'orders',
    },
    {
      id: 'history',
      label: 'Purchase History',
      desc: 'View past transactions',
      icon: History,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      action: 'history',
    },
    {
      id: 'reports',
      label: 'Spend Reports',
      desc: 'Analyse procurement data',
      icon: TrendingUp,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      action: 'reports',
    },
  ];

  const handleUnsave = (id: string) => { buyerApi.unsaveListing(id).then(()=>setSavedIds((prev) => prev.filter((s) => s !== id))).catch(()=>{}); };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good morning, {profile?.fullName?.split(' ')[0] || 'Buyer'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.businessName || ''} · Procurement Home · Sep 10, 2026
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live · Updated just now
        </div>
      </div>

      {/* Procurement KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <button
              key={kpi.id}
              onClick={() => onNavigate(kpi.action)}
              className="card p-5 text-left hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <KpiIcon size={20} className={kpi.color} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.trendUp ? 'text-success bg-success/10' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-150 tabular-nums">
                {kpi.value}
              </div>
              <div className="text-sm font-semibold text-foreground mt-0.5">{kpi.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Quick-Access Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((qa) => {
            const QaIcon = qa.icon;
            return (
              <button
                key={qa.id}
                onClick={() => onNavigate(qa.action)}
                className="card p-4 text-left hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col gap-2"
              >
                <div className={`w-9 h-9 rounded-xl ${qa.bg} flex items-center justify-center`}>
                  <QaIcon size={18} className={qa.color} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">{qa.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{qa.desc}</div>
                </div>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 mt-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Order Status Widgets — 3 cols */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Order Status</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeOrders.length} active orders in pipeline</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              No active orders
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Requested'];
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={`home-order-${order.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-100"
                  >
                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon size={15} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.color} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Droplets size={11} />
                        {order.oilType} · {order.volumeLiters} L · Grade {order.gradeLabel}
                        <span className="text-muted-foreground/50">·</span>
                        <MapPin size={11} />
                        {order.city}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-xs font-bold text-foreground">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      {order.pickupDate && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Pickup {order.pickupDate}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => onNavigate('orders')}
            className="w-full mt-4 btn-outline text-xs py-2"
          >
            Manage All Orders
          </button>
        </div>

        {/* Recent Saved Listings — 2 cols */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recently Saved</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{savedIds.length} listings saved</p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              See library <ChevronRight size={12} />
            </button>
          </div>

          {recentSaved.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Bookmark size={32} className="mx-auto mb-2 opacity-30" />
              No saved listings yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentSaved.map((listing) => (
                <div
                  key={`home-saved-${listing.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-100 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{listing.oilType} Oil</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${GRADE_COLORS[listing.gradeLabel]}`}>
                        Grade {listing.gradeLabel}
                      </span>
                      <span className={`text-xs font-medium ${listing.status === 'Available' ? 'text-success' : 'text-amber-600'}`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <MapPin size={11} />
                      {listing.city}
                      <span className="text-muted-foreground/50">·</span>
                      <Droplets size={11} />
                      {listing.volumeLiters} L
                    </div>
                    <div className="font-mono text-sm font-extrabold text-primary mt-1">
                      ₹{listing.pricePerLiter}/L
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(listing.id)}
                    className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors duration-150 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Remove from saved"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigate('listings')}
            className="w-full mt-4 btn-primary text-xs py-2"
          >
            Browse More Listings
          </button>
        </div>
      </div>

      {/* Saved Listings Library */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bookmark size={15} className="text-primary" />
              Saved Listings Library
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {savedListings.length} listings saved · {savedListings.filter(l => l.status === 'Available').length} available now
            </p>
          </div>
          <button
            onClick={() => onNavigate('listings')}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            Browse all <ChevronRight size={12} />
          </button>
        </div>

        {savedListings.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            <Bookmark size={36} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No saved listings</p>
            <p className="text-xs mt-1">Browse listings and save ones you're interested in</p>
            <button onClick={() => onNavigate('listings')} className="btn-primary text-xs py-2 px-4 mt-4">
              Browse Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {savedListings.map((listing) => (
              <SavedListingCard
                key={`library-${listing.id}`}
                listing={listing}
                onUnsave={handleUnsave}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedListingCard({
  listing,
  onUnsave,
  onNavigate,
}: {
  listing: UCOMarketListing;
  onUnsave: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const OIL_COLORS: Record<string, string> = {
    Palm: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Sunflower: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    Mustard: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    Blended: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    Soybean: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400',
  };

  return (
    <div className="border border-border rounded-xl p-4 hover:shadow-card transition-all duration-200 group flex flex-col gap-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OIL_COLORS[listing.oilType] || 'bg-muted text-muted-foreground'}`}>
            {listing.oilType}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${GRADE_COLORS[listing.gradeLabel]}`}>
            Grade {listing.gradeLabel}
          </span>
        </div>
        <button
          onClick={() => onUnsave(listing.id)}
          className="p-1 rounded-lg hover:bg-destructive/10 text-primary hover:text-destructive transition-colors duration-150 flex-shrink-0"
          title="Remove from saved"
        >
          <Bookmark size={14} className="fill-current" />
        </button>
      </div>

      <div>
        <div className="text-xl font-extrabold text-primary tabular-nums">₹{listing.pricePerLiter}/L</div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <Droplets size={11} />
          {listing.volumeLiters} L available · min {listing.minOrderLiters} L
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin size={11} />
        {listing.city}, {listing.state}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <span className={`text-xs font-medium ${listing.status === 'Available' ? 'text-success' : listing.status === 'Limited' ? 'text-amber-600' : 'text-muted-foreground'}`}>
          ● {listing.status}
        </span>
        <button
          onClick={() => onNavigate('listings')}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5"
        >
          View <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
