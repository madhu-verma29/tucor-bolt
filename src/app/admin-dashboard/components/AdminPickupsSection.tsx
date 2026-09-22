'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Search, CheckCircle2, Clock, MapPin, User, Package } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { adminApi, type AdminPickup } from '@/lib/admin-api';


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
  const [adminPickups,setAdminPickups]=useState<AdminPickup[]>([]);
  useEffect(()=>{adminApi.pickups().then(setAdminPickups).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load pickups'));},[]);
  const updatePickup=async(id:string,action:'assign'|'complete')=>{try{const updated=await adminApi.pickupAction(id,action);setAdminPickups(items=>items.map(p=>p.id===id?updated:p));toast.success(action==='assign'?`Agent assigned to ${id}`:`${id} marked as completed`);}catch(e){toast.error(e instanceof Error?e.message:'Unable to update pickup');}};

  const filtered = adminPickups.filter((p) => {
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
          { label: 'Total Pickups', value: adminPickups.length, color: 'text-foreground', bg: 'bg-muted', icon: Package },
          { label: 'Pending Assignment', value: adminPickups.filter((p) => p.status === 'Pending').length, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'In Progress', value: adminPickups.filter((p) => ['Scheduled', 'Assigned', 'In Transit'].includes(p.status)).length, color: 'text-info', bg: 'bg-info-bg', icon: Truck },
          { label: 'Completed', value: adminPickups.filter((p) => p.status === 'Completed').length, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
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
                      onClick={() => updatePickup(pickup.id,'assign')}
                      className="btn-primary py-1.5 text-xs gap-1.5"
                    >
                      <User size={12} />
                      Assign Agent
                    </button>
                  )}
                  {pickup.status === 'In Transit' && (
                    <button
                      onClick={() => updatePickup(pickup.id,'complete')}
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
