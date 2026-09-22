'use client';

import React, { useEffect, useState } from 'react';
import { ListPlus, Search, CheckCircle2, Clock, AlertCircle, Eye, Flag, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { adminApi, type AdminListing } from '@/lib/admin-api';


const statusConfig = {
  'Active': { className: 'badge-active', icon: CheckCircle2 },
  'Pending Verification': { className: 'badge-pending', icon: Clock },
  'Flagged': { className: 'badge-danger', icon: Flag },
  'Rejected': { className: 'badge-danger', icon: XCircle },
  'Expired': { className: 'text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium', icon: AlertCircle },
};

type FilterStatus = 'all' | AdminListing['status'];

export default function AdminListingsSection() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [adminListings,setAdminListings]=useState<AdminListing[]>([]);
  useEffect(()=>{adminApi.listings().then(setAdminListings).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load listings'));},[]);
  const listingAction=async(id:string,action:'approve'|'flag')=>{try{const updated=await adminApi.listingAction(id,action);setAdminListings(items=>items.map(l=>l.id===id?updated:l));toast.success(action==='approve'?`Listing ${id} approved`:`Listing ${id} flagged for review`);}catch(e){toast.error(e instanceof Error?e.message:'Unable to update listing');}};

  const filtered = adminListings.filter((l) => {
    const matchSearch = l.id.toLowerCase().includes(search.toLowerCase()) || l.oilType.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: adminListings.length,
    Active: adminListings.filter((l) => l.status === 'Active').length,
    'Pending Verification': adminListings.filter((l) => l.status === 'Pending Verification').length,
    Flagged: adminListings.filter((l) => l.status === 'Flagged').length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Listings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin Console · Monitor and manage all UCO listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: adminListings.length, color: 'text-foreground', bg: 'bg-muted', icon: ListPlus },
          { label: 'Active', value: counts.Active, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Pending Review', value: counts['Pending Verification'], color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'Flagged', value: counts.Flagged, color: 'text-danger', bg: 'bg-danger-bg', icon: Flag },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`admin-lst-stat-${stat.label}`} className="card p-5">
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
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'Active', 'Pending Verification', 'Flagged', 'Rejected'] as FilterStatus[]).map((s) => (
            <button
              key={`admin-lst-filter-${s}`}
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Listing ID', 'Oil Type', 'Volume', 'Grade', 'Price/L', 'Seller', 'City', 'Listed', 'Status', 'Actions'].map((h) => (
                  <th key={`admin-lst-col-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((listing) => {
                const cfg = statusConfig[listing.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={`admin-lst-${listing.id}`} className="hover:bg-muted/30 transition-colors duration-100">
                    <td className="px-4 py-3"><span className="font-mono-data text-xs font-semibold text-foreground">{listing.id}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-foreground">{listing.oilType}</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-sm text-foreground">{listing.volumeLiters}L</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${listing.gradeLabel === 'A' ? 'bg-success-bg text-success' : listing.gradeLabel === 'B' ? 'bg-warning-bg text-warning' : 'bg-muted text-muted-foreground'}`}>
                        Grade {listing.gradeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono-data text-sm text-foreground">₹{listing.pricePerLiter}/L</span></td>
                    <td className="px-4 py-3"><span className="font-mono-data text-xs text-muted-foreground">{listing.sellerRef}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{listing.city}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{listing.listedAt}</span></td>
                    <td className="px-4 py-3">
                      <span className={`${cfg.className} text-xs flex items-center gap-1 w-fit`}>
                        <StatusIcon size={11} />
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast.info(`Viewing listing ${listing.id}`)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-150" title="View">
                          <Eye size={14} />
                        </button>
                        {listing.status === 'Pending Verification' && (
                          <button onClick={() => listingAction(listing.id,'approve')} className="p-1.5 rounded-lg hover:bg-success-bg text-muted-foreground hover:text-success transition-colors duration-150" title="Approve">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {listing.status === 'Active' && (
                          <button onClick={() => listingAction(listing.id,'flag')} className="p-1.5 rounded-lg hover:bg-warning-bg text-muted-foreground hover:text-warning transition-colors duration-150" title="Flag">
                            <Flag size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">No listings found</div>
          )}
        </div>
      </div>
    </div>
  );
}
