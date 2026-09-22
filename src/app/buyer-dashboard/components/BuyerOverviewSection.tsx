'use client';

import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, History, TrendingUp, Leaf, Droplets } from 'lucide-react';
import { buyerApi, type BuyerOrder, type BuyerProfile, type DashboardMetrics, type UCOMarketListing } from '@/lib/buyer-api';
import Icon from '@/components/ui/AppIcon';


interface Props {
  onNavigate: (id: string) => void;
}

const ACTIVE_STATUSES = ['Requested', 'Under Review', 'Matched', 'Confirmed', 'Pickup Scheduled', 'Picked Up', 'Delivered', 'Payment', 'Payment Pending'];

export default function BuyerOverviewSection({ onNavigate }: Props) {
  const [orders,setOrders]=useState<BuyerOrder[]>([]); const [listings,setListings]=useState<UCOMarketListing[]>([]); const [profile,setProfile]=useState<BuyerProfile|null>(null); const [metrics,setMetrics]=useState<DashboardMetrics|null>(null);
  useEffect(()=>{Promise.all([buyerApi.orders(),buyerApi.listings(),buyerApi.profile(),buyerApi.dashboard()]).then(([o,l,p,m])=>{setOrders(o);setListings(l);setProfile(p);setMetrics(m)}).catch(()=>{});},[]);
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => ['Completed', 'Settled'].includes(o.status));
  const availableListings = metrics?.availableListings ?? listings.filter((l) => l.status === 'Available').length;

  const kpis = [
    {
      label: 'Available Listings',
      value: availableListings.toString(),
      sub: 'ready to source',
      icon: Search,
      color: 'text-primary',
      bg: 'bg-primary/10',
      action: 'search',
    },
    {
      label: 'Active Orders',
      value: activeOrders.length.toString(),
      sub: 'in progress',
      icon: ShoppingCart,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      action: 'orders',
    },
    {
      label: 'UCO Sourced',
      value: `${(metrics?.totalUcoSourced ?? 0).toLocaleString('en-IN')} L`,
      sub: 'total procured',
      icon: Droplets,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      action: 'history',
    },
    {
      label: 'Total Spend',
      value: `₹${((metrics?.totalSpend ?? 0) / 100000).toFixed(1)}L`,
      sub: 'settled payments',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      action: 'payments',
    },
    {
      label: 'CO₂ Offset',
      value: `${(metrics?.co2OffsetKg ?? 0).toLocaleString('en-IN')} kg`,
      sub: 'estimated impact',
      icon: Leaf,
      color: 'text-success',
      bg: 'bg-success/10',
      action: 'sustainability',
    },
    {
      label: 'Orders Completed',
      value: completedOrders.length.toString(),
      sub: 'purchase history',
      icon: History,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      action: 'history',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, {profile?.fullName?.split(' ')[0] || 'Buyer'} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your UCO procurement overview — Sep 9, 2026
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live data · Updated just now
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={`buyer-kpi-${kpi.label}`}
              onClick={() => onNavigate(kpi.action)}
              className="card p-4 text-left hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={kpi.color} />
              </div>
              <div className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-150">{kpi.value}</div>
              <div className="text-xs font-semibold text-foreground mt-0.5">{kpi.label}</div>
              <div className="text-xs text-muted-foreground">{kpi.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Active orders preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-foreground text-sm">Active Orders</div>
            <button onClick={() => onNavigate('orders')} className="text-xs text-primary font-semibold hover:underline">View all</button>
          </div>
          {activeOrders.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No active orders</div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeOrders.slice(0, 3).map((order) => (
                <div key={`overview-order-${order.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-100">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono-data text-xs font-bold text-foreground">{order.id}</div>
                    <div className="text-xs text-muted-foreground">{order.oilType} · {order.volumeLiters} L · {order.city}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono-data text-xs font-bold text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      order.status === 'Pickup Scheduled' ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' :
                      order.status === 'Confirmed'? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 'text-muted-foreground bg-muted'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-foreground text-sm">Recent Listings</div>
            <button onClick={() => onNavigate('search')} className="text-xs text-primary font-semibold hover:underline">Browse all</button>
          </div>
          <div className="flex flex-col gap-2">
            {listings.slice(0, 4).map((listing) => (
              <div key={`overview-listing-${listing.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-100">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground">{listing.oilType} Oil — Grade {listing.gradeLabel}</div>
                  <div className="text-xs text-muted-foreground">{listing.city} · {listing.volumeLiters} L</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono-data text-xs font-bold text-primary">₹{listing.pricePerLiter}/L</div>
                  <span className={`text-xs ${listing.status === 'Available' ? 'text-success' : 'text-amber-600'}`}>{listing.status}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="w-full mt-3 btn-primary text-xs py-2"
          >
            Source UCO Now
          </button>
        </div>
      </div>
    </div>
  );
}
