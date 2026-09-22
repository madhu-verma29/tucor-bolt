'use client';

import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, Building2 } from 'lucide-react';
import { adminApi, type AdminBusiness as Business } from '@/lib/admin-api';
import { toast } from 'sonner';


const statusColors: Record<string, string> = {
  Approved: 'bg-green-500/15 text-green-600 border-green-500/30',
  Pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Rejected: 'bg-red-500/15 text-red-600 border-red-500/30',
  Suspended: 'bg-muted text-muted-foreground border-border',
};

export default function AdminBusinessesSection() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  useEffect(()=>{adminApi.businesses().then(setBusinesses).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load businesses'));},[]);

  const filtered = businesses.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.owner.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || b.type === filterType;
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleApprove = async (id: string) => {
    try{const updated=await adminApi.businessAction(id,'approve');setBusinesses(prev=>prev.map(b=>b.id===id?updated:b));if(selected?.id===id)setSelected(updated);toast.success('Business approved');}catch(e){toast.error(e instanceof Error?e.message:'Unable to approve business');}
  };

  const handleReject = async (id: string) => {
    try{const updated=await adminApi.businessAction(id,'reject');setBusinesses(prev=>prev.map(b=>b.id===id?updated:b));if(selected?.id===id)setSelected(updated);toast.success('Business rejected');}catch(e){toast.error(e instanceof Error?e.message:'Unable to reject business');}
  };

  const pendingCount = businesses.filter((b) => b.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Businesses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{businesses.length} registered · {pendingCount} pending approval</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-semibold">
            <Building2 size={13} />
            {pendingCount} businesses awaiting approval
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search businesses, owners, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full text-sm"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Types</option>
          <option value="Seller">Seller</option>
          <option value="Buyer">Buyer</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} card overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Volume/mo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((biz) => (
                  <tr
                    key={biz.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 cursor-pointer ${selected?.id === biz.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelected(biz)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 size={15} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{biz.name}</div>
                          <div className="text-xs text-muted-foreground">{biz.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${biz.type === 'Seller' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'}`}>{biz.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${statusColors[biz.status]}`}>{biz.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{biz.monthlyVolume}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {biz.status === 'Pending' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleApprove(biz.id); }} className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors duration-100" title="Approve">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleReject(biz.id); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors duration-100" title="Reject">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setSelected(biz); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-100">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No businesses match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">Business Details</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 size={22} className="text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{selected.name}</div>
                <div className="text-xs text-muted-foreground">{selected.id}</div>
                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium mt-1 inline-block ${statusColors[selected.status]}`}>{selected.status}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { label: 'Owner', value: selected.owner },
                { label: 'Email', value: selected.email },
                { label: 'Category', value: selected.category },
                { label: 'Location', value: selected.location },
                { label: 'GST', value: selected.gst },
                { label: 'FSSAI', value: selected.fssai || 'N/A' },
                { label: 'Submitted', value: selected.submittedAt },
                { label: 'Approved', value: selected.approvedAt || '—' },
                { label: 'Monthly Vol.', value: selected.monthlyVolume },
              ].map((item) => (
                <div key={`biz-detail-${item.label}`} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground text-right max-w-32 truncate">{item.value}</span>
                </div>
              ))}
            </div>
            {selected.status === 'Pending' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <button onClick={() => handleApprove(selected.id)} className="w-full btn-primary py-2 text-sm gap-2">
                  <CheckCircle size={15} />
                  Approve Business
                </button>
                <button onClick={() => handleReject(selected.id)} className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-600 border border-red-500/30 text-sm font-semibold hover:bg-red-500/20 transition-colors duration-150 flex items-center justify-center gap-2">
                  <XCircle size={15} />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
