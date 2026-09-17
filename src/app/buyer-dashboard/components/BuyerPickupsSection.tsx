'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle2, Clock, MapPin, Package, User } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



interface BuyerPickup {
  id: string;
  orderId: string;
  oilType: string;
  volumeLiters: number;
  scheduledDate: string;
  status: 'Pending' | 'Scheduled' | 'Assigned' | 'In Transit' | 'Completed';
  agentName: string;
  vehicleNumber: string;
  sellerCity: string;
  notes?: string;
}

const mockBuyerPickups: BuyerPickup[] = [
  { id: 'PKP-2026-0094', orderId: 'ORD-2026-0201', oilType: 'Palm', volumeLiters: 480, scheduledDate: '2026-09-12', status: 'Scheduled', agentName: 'Rajan Mehta', vehicleNumber: 'MH-04-CX-7721', sellerCity: 'Mumbai', notes: 'Arrive between 9 AM – 11 AM' },
  { id: 'PKP-2026-0089', orderId: 'ORD-2026-0195', oilType: 'Soybean', volumeLiters: 390, scheduledDate: '2026-09-16', status: 'Assigned', agentName: 'Suresh Pillai', vehicleNumber: 'MH-01-BK-4490', sellerCity: 'Hyderabad' },
  { id: 'PKP-2026-0078', orderId: 'ORD-2026-0188', oilType: 'Sunflower', volumeLiters: 310, scheduledDate: '2026-09-20', status: 'Pending', agentName: 'Unassigned', vehicleNumber: '—', sellerCity: 'Pune' },
  { id: 'PKP-2026-0065', orderId: 'ORD-2026-0174', oilType: 'Blended', volumeLiters: 650, scheduledDate: '2026-08-20', status: 'Completed', agentName: 'Anil Sharma', vehicleNumber: 'MH-02-GH-3312', sellerCity: 'Mumbai', notes: '648L confirmed. Minor 2L variance.' },
];

const statusConfig = {
  Pending: { className: 'badge-pending', icon: Clock },
  Scheduled: { className: 'badge-info', icon: Clock },
  Assigned: { className: 'badge-info', icon: User },
  'In Transit': { className: 'text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium', icon: Truck },
  Completed: { className: 'badge-active', icon: CheckCircle2 },
};

export default function BuyerPickupsSection() {
  const [filter, setFilter] = useState<'all' | BuyerPickup['status']>('all');

  const filtered = mockBuyerPickups.filter((p) => filter === 'all' || p.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pickups</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track UCO pickup schedules, agent assignments, and delivery confirmations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pickups', value: mockBuyerPickups.length, color: 'text-foreground', bg: 'bg-muted', icon: Package },
          { label: 'Pending', value: mockBuyerPickups.filter((p) => p.status === 'Pending').length, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'Scheduled', value: mockBuyerPickups.filter((p) => ['Scheduled', 'Assigned'].includes(p.status)).length, color: 'text-info', bg: 'bg-info-bg', icon: Truck },
          { label: 'Completed', value: mockBuyerPickups.filter((p) => p.status === 'Completed').length, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`buyer-pkp-stat-${stat.label}`} className="card p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className={`text-2xl font-bold font-mono-data ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'Pending', 'Scheduled', 'Assigned', 'Completed'] as const).map((s) => (
          <button
            key={`buyer-pkp-filter-${s}`}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Pickup cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((pickup) => {
          const cfg = statusConfig[pickup.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={`buyer-pkp-${pickup.id}`} className="card p-5">
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
                    {pickup.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">{pickup.notes}</p>
                    )}
                  </div>
                </div>
                {pickup.status === 'Completed' && (
                  <span className="badge-active text-xs flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Delivered
                  </span>
                )}
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
