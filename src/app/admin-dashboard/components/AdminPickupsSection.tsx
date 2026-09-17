'use client';

import React, { useState } from 'react';
import { Truck, Search, CheckCircle2, Clock, MapPin, User, Package } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface AdminPickup {
  id: string;
  orderId: string;
  oilType: string;
  volumeLiters: number;
  scheduledDate: string;
  status: 'Pending' | 'Scheduled' | 'Assigned' | 'In Transit' | 'Completed';
  agentName: string;
  vehicleNumber: string;
  sellerCity: string;
  sellerRef: string;
  buyerRef: string;
}

const mockAdminPickups: AdminPickup[] = [
  { id: 'PKP-2026-0094', orderId: 'ORD-2026-0187', oilType: 'Sunflower', volumeLiters: 310, scheduledDate: '2026-09-12', status: 'Scheduled', agentName: 'Rajan Mehta', vehicleNumber: 'MH-04-CX-7721', sellerCity: 'Mumbai', sellerRef: 'SEL-****-0038', buyerRef: 'BYR-****-7821' },
  { id: 'PKP-2026-0089', orderId: 'ORD-2026-0162', oilType: 'Palm', volumeLiters: 240, scheduledDate: '2026-09-15', status: 'Assigned', agentName: 'Suresh Pillai', vehicleNumber: 'MH-01-BK-4490', sellerCity: 'Mumbai', sellerRef: 'SEL-****-0041', buyerRef: 'BYR-****-9015' },
  { id: 'PKP-2026-0082', orderId: 'ORD-2026-0201', oilType: 'Soybean', volumeLiters: 390, scheduledDate: '2026-09-16', status: 'Pending', agentName: 'Unassigned', vehicleNumber: '—', sellerCity: 'Hyderabad', sellerRef: 'SEL-****-0021', buyerRef: 'BYR-****-4201' },
  { id: 'PKP-2026-0078', orderId: 'ORD-2026-0195', oilType: 'Mustard', volumeLiters: 220, scheduledDate: '2026-09-10', status: 'In Transit', agentName: 'Vikram Nair', vehicleNumber: 'KA-05-MN-3390', sellerCity: 'Delhi', sellerRef: 'SEL-****-0033', buyerRef: 'BYR-****-3307' },
  { id: 'PKP-2026-0071', orderId: 'ORD-2026-0174', oilType: 'Blended', volumeLiters: 650, scheduledDate: '2026-08-20', status: 'Completed', agentName: 'Anil Sharma', vehicleNumber: 'MH-02-GH-3312', sellerCity: 'Mumbai', sellerRef: 'SEL-****-0029', buyerRef: 'BYR-****-4432' },
  { id: 'PKP-2026-0065', orderId: 'ORD-2026-0188', oilType: 'Palm', volumeLiters: 820, scheduledDate: '2026-09-25', status: 'Pending', agentName: 'Unassigned', vehicleNumber: '—', sellerCity: 'Kolkata', sellerRef: 'SEL-****-0015', buyerRef: 'BYR-****-8812' },
];

const statusConfig = {
  Pending: { className: 'badge-pending', icon: Clock, color: 'text-warning' },
  Scheduled: { className: 'badge-info', icon: Clock, color: 'text-info' },
  Assigned: { className: 'badge-info', icon: User, color: 'text-info' },
  'In Transit': { className: 'text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium', icon: Truck, color: 'text-primary' },
  Completed: { className: 'badge-active', icon: CheckCircle2, color: 'text-success' },
};

type FilterStatus = 'all' | AdminPickup['status'];

export default function AdminPickupsSection() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = mockAdminPickups.filter((p) => {
    const matchSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.orderId.toLowerCase().includes(search.toLowerCase()) || p.agentName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pickups</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin Console · Track and manage all UCO collection pickups</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pickups', value: mockAdminPickups.length, color: 'text-foreground', bg: 'bg-muted', icon: Package },
          { label: 'Pending Assignment', value: mockAdminPickups.filter((p) => p.status === 'Pending').length, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'In Progress', value: mockAdminPickups.filter((p) => ['Scheduled', 'Assigned', 'In Transit'].includes(p.status)).length, color: 'text-info', bg: 'bg-info-bg', icon: Truck },
          { label: 'Completed', value: mockAdminPickups.filter((p) => p.status === 'Completed').length, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`admin-pkp-stat-${stat.label}`} className="card p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className={`text-2xl font-bold font-mono-data ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pickups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'Pending', 'Scheduled', 'Assigned', 'In Transit', 'Completed'] as FilterStatus[]).map((s) => (
            <button
              key={`admin-pkp-filter-${s}`}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((pickup) => {
          const cfg = statusConfig[pickup.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={`admin-pkp-${pickup.id}`} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-data text-sm font-bold text-foreground">{pickup.id}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="font-mono-data text-xs text-muted-foreground">{pickup.orderId}</span>
                      <span className={`${cfg.className} text-xs flex items-center gap-1`}>
                        <StatusIcon size={11} />
                        {pickup.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{pickup.oilType} · {pickup.volumeLiters}L</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={11} />
                        {pickup.sellerCity}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {pickup.scheduledDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">Agent: <span className="text-foreground font-medium">{pickup.agentName}</span></span>
                      {pickup.vehicleNumber !== '—' && (
                        <span className="text-xs text-muted-foreground">Vehicle: <span className="font-mono-data text-foreground">{pickup.vehicleNumber}</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pickup.status === 'Pending' && (
                    <button
                      onClick={() => toast.success(`Agent assigned to ${pickup.id}`)}
                      className="btn-primary py-1.5 text-xs gap-1.5"
                    >
                      <User size={12} />
                      Assign Agent
                    </button>
                  )}
                  {pickup.status === 'In Transit' && (
                    <button
                      onClick={() => toast.success(`${pickup.id} marked as completed`)}
                      className="btn-secondary py-1.5 text-xs gap-1.5"
                    >
                      <CheckCircle2 size={12} />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
            <Truck size={36} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No pickups found</p>
          </div>
        )}
      </div>
    </div>
  );
}
