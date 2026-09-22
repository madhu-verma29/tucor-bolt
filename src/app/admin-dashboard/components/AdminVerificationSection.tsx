'use client';

import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { adminApi, type AdminVerification } from '@/lib/admin-api';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  'Pending': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  'Under Review': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  'Approved': 'bg-green-500/15 text-green-600 border-green-500/30',
  'Rejected': 'bg-red-500/15 text-red-600 border-red-500/30',
  'More Info Required': 'bg-orange-500/15 text-orange-600 border-orange-500/30',
};

const docStatusColors: Record<string, string> = {
  Submitted: 'text-blue-500',
  Verified: 'text-green-500',
  Rejected: 'text-red-500',
  Missing: 'text-muted-foreground',
};

const priorityColors: Record<string, string> = {
  High: 'bg-red-500/10 text-red-600',
  Normal: 'bg-blue-500/10 text-blue-600',
  Low: 'bg-muted text-muted-foreground',
};

export default function AdminVerificationSection() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState<AdminVerification | null>(null);
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  useEffect(()=>{adminApi.verifications().then(setVerifications).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load verifications'));},[]);

  const filtered = verifications.filter((v) => {
    const matchSearch = v.businessName.toLowerCase().includes(search.toLowerCase()) || v.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id: string) => {
    try{const updated=await adminApi.verificationAction(id,'approve');setVerifications(prev=>prev.map(v=>v.id===id?updated:v));if(selected?.id===id)setSelected(updated);toast.success('Verification approved');}catch(e){toast.error(e instanceof Error?e.message:'Unable to approve verification');}
  };

  const handleReject = async (id: string) => {
    try{const updated=await adminApi.verificationAction(id,'reject','Rejected by administrator');setVerifications(prev=>prev.map(v=>v.id===id?updated:v));if(selected?.id===id)setSelected(updated);toast.success('Verification rejected');}catch(e){toast.error(e instanceof Error?e.message:'Unable to reject verification');}
  };

  const handleReview = async (id: string) => {
    try{const updated=await adminApi.verificationAction(id,'review');setVerifications(prev=>prev.map(v=>v.id===id?updated:v));if(selected?.id===id)setSelected(updated);toast.success('Review started');}catch(e){toast.error(e instanceof Error?e.message:'Unable to start review');}
  };

  const pendingCount = verifications.filter((v) => v.status === 'Pending' || v.status === 'Under Review').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification Workflows</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{verifications.length} total requests · {pendingCount} active</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-semibold">
            <ShieldCheck size={13} />
            {pendingCount} verification requests active
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search business or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full text-sm"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="More Info Required">More Info Required</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col gap-3`}>
          {filtered.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelected(v)}
              className={`card p-4 cursor-pointer hover:shadow-card-lg transition-all duration-200 ${selected?.id === v.id ? 'ring-2 ring-primary/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-sm">{v.businessName}</div>
                    <div className="text-xs text-muted-foreground">{v.id} · {v.owner} · {v.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${priorityColors[v.priority]}`}>{v.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${statusColors[v.status]}`}>{v.status}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {v.documents.map((doc) => (
                  <div key={`doc-${v.id}-${doc.name}`} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-lg">
                    <FileText size={11} className={docStatusColors[doc.status]} />
                    <span className="text-foreground">{doc.name}</span>
                    <span className={`font-medium ${docStatusColors[doc.status]}`}>· {doc.status}</span>
                  </div>
                ))}
              </div>

              {v.notes && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-orange-600 bg-orange-500/10 rounded-lg px-2.5 py-1.5">
                  <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
                  {v.notes}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={11} />
                  Submitted {v.submittedAt}
                </span>
                {(v.status === 'Pending' || v.status === 'Under Review') && (
                  <div className="flex items-center gap-1.5">
                    {v.status === 'Pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReview(v.id); }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/30 font-semibold hover:bg-blue-500/20 transition-colors duration-100"
                      >
                        Start Review
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApprove(v.id); }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 border border-green-500/30 font-semibold hover:bg-green-500/20 transition-colors duration-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReject(v.id); }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 border border-red-500/30 font-semibold hover:bg-red-500/20 transition-colors duration-100"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card p-12 text-center text-sm text-muted-foreground">No verification requests match your filters</div>
          )}
        </div>

        {selected && (
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">Verification Detail</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div>
              <div className="font-semibold text-foreground">{selected.businessName}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{selected.id}</div>
              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium mt-2 inline-block ${statusColors[selected.status]}`}>{selected.status}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</h4>
              {selected.documents.map((doc) => (
                <div key={`detail-doc-${doc.name}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText size={12} className={docStatusColors[doc.status]} />
                    <span className="text-foreground">{doc.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${docStatusColors[doc.status]}`}>{doc.status}</span>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="text-xs text-orange-600 bg-orange-500/10 rounded-xl px-3 py-2.5 flex items-start gap-2">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                {selected.notes}
              </div>
            )}
            {(selected.status === 'Pending' || selected.status === 'Under Review') && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <button onClick={() => handleApprove(selected.id)} className="w-full btn-primary py-2 text-sm gap-2">
                  <CheckCircle size={15} />
                  Approve Verification
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
