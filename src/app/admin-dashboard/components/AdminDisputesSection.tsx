'use client';

import React, { useState } from 'react';
import { Search, AlertTriangle, MessageSquare, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string;
  raisedByRole: 'Seller' | 'Buyer';
  against: string;
  reason: string;
  description: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Escalated' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  amount: number;
  raisedAt: string;
  updatedAt: string;
  resolution?: string;
  timeline: { date: string; action: string; by: string }[];
}

const mockDisputes: Dispute[] = [
  {
    id: 'DSP-2026-0012', orderId: 'ORD-2026-0198', raisedBy: 'Sunrise Restaurants', raisedByRole: 'Seller',
    against: 'Green Energy Solutions', reason: 'Quality Dispute',
    description: 'Buyer claims oil quality does not match Grade A specification. Seller disputes this and has lab test results.',
    status: 'Escalated', priority: 'High', amount: 7200, raisedAt: '2026-09-06', updatedAt: '2026-09-09',
    timeline: [
      { date: '2026-09-06', action: 'Dispute raised by seller', by: 'Sunrise Restaurants' },
      { date: '2026-09-07', action: 'TUCOR acknowledged dispute', by: 'TUCOR Admin' },
      { date: '2026-09-08', action: 'Investigation started', by: 'TUCOR Admin' },
      { date: '2026-09-09', action: 'Escalated to senior review', by: 'TUCOR Admin' },
    ],
  },
  {
    id: 'DSP-2026-0011', orderId: 'ORD-2026-0185', raisedBy: 'BioFuel India Ltd.', raisedByRole: 'Buyer',
    against: 'Hotel Grand Palace', reason: 'Volume Mismatch',
    description: 'Received 480L instead of confirmed 600L. Requesting partial refund or additional collection.',
    status: 'Under Investigation', priority: 'Medium', amount: 18000, raisedAt: '2026-09-04', updatedAt: '2026-09-08',
    timeline: [
      { date: '2026-09-04', action: 'Dispute raised by buyer', by: 'BioFuel India Ltd.' },
      { date: '2026-09-05', action: 'TUCOR acknowledged dispute', by: 'TUCOR Admin' },
      { date: '2026-09-08', action: 'Investigation started — pickup agent contacted', by: 'TUCOR Admin' },
    ],
  },
  {
    id: 'DSP-2026-0010', orderId: 'ORD-2026-0172', raisedBy: 'Cafe Bliss', raisedByRole: 'Seller',
    against: 'Biodiesel Corp', reason: 'Payment Delay',
    description: 'Payment overdue by 12 days. Seller requesting immediate settlement.',
    status: 'Resolved', priority: 'Low', amount: 4680, raisedAt: '2026-08-28', updatedAt: '2026-09-02',
    resolution: 'Payment processed on 2026-09-02. Dispute closed.',
    timeline: [
      { date: '2026-08-28', action: 'Dispute raised by seller', by: 'Cafe Bliss' },
      { date: '2026-08-29', action: 'TUCOR reviewed payment status', by: 'TUCOR Admin' },
      { date: '2026-09-02', action: 'Payment processed and settled', by: 'TUCOR Finance' },
      { date: '2026-09-02', action: 'Dispute resolved and closed', by: 'TUCOR Admin' },
    ],
  },
];

const statusConfig: Record<string, string> = {
  'Open': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  'Under Investigation': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  'Resolved': 'bg-green-500/15 text-green-600 border-green-500/30',
  'Escalated': 'bg-red-500/15 text-red-600 border-red-500/30',
  'Closed': 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  High: 'bg-red-500/10 text-red-600',
  Medium: 'bg-amber-500/10 text-amber-600',
  Low: 'bg-muted text-muted-foreground',
};

export default function AdminDisputesSection() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);

  const filtered = disputes.filter((d) => {
    const matchSearch = d.id.toLowerCase().includes(search.toLowerCase()) || d.raisedBy.toLowerCase().includes(search.toLowerCase()) || d.orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleResolve = (id: string) => {
    setDisputes((prev) => prev.map((d) => d.id === id ? {
      ...d, status: 'Resolved' as const,
      resolution: 'Resolved by admin on ' + new Date().toISOString().split('T')[0],
      timeline: [...d.timeline, { date: new Date().toISOString().split('T')[0], action: 'Dispute resolved by admin', by: 'TUCOR Admin' }],
    } : d));
  };

  const handleEscalate = (id: string) => {
    setDisputes((prev) => prev.map((d) => d.id === id ? {
      ...d, status: 'Escalated' as const,
      timeline: [...d.timeline, { date: new Date().toISOString().split('T')[0], action: 'Escalated to senior review', by: 'TUCOR Admin' }],
    } : d));
  };

  const openCount = disputes.filter((d) => d.status === 'Open' || d.status === 'Escalated').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispute Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{disputes.length} total disputes · {openCount} requiring action</p>
        </div>
        {openCount > 0 && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 font-semibold">
            <AlertTriangle size={13} />
            {openCount} disputes need attention
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search dispute ID, party, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full text-sm"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((dispute) => (
          <div key={dispute.id} className="card overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-muted/20 transition-colors duration-100"
              onClick={() => setExpanded(expanded === dispute.id ? null : dispute.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dispute.status === 'Escalated' ? 'bg-red-500/15' : dispute.status === 'Resolved' ? 'bg-green-500/15' : 'bg-amber-500/15'}`}>
                    <AlertTriangle size={18} className={dispute.status === 'Escalated' ? 'text-red-500' : dispute.status === 'Resolved' ? 'text-green-500' : 'text-amber-500'} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{dispute.id}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground font-mono">{dispute.orderId}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{dispute.reason} · Raised by {dispute.raisedBy} ({dispute.raisedByRole})</div>
                    <div className="text-xs text-foreground mt-1 line-clamp-1">{dispute.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${priorityColors[dispute.priority]}`}>{dispute.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${statusConfig[dispute.status]}`}>{dispute.status}</span>
                  {expanded === dispute.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Amount: <span className="font-semibold text-foreground">₹{dispute.amount.toLocaleString()}</span></span>
                <span>Raised: {dispute.raisedAt}</span>
                <span>Updated: {dispute.updatedAt}</span>
              </div>
            </div>

            {expanded === dispute.id && (
              <div className="border-t border-border p-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Timeline */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Activity Timeline</h4>
                    <div className="flex flex-col gap-2.5">
                      {dispute.timeline.map((t, idx) => (
                        <div key={`timeline-${dispute.id}-${idx}`} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <div>
                            <div className="text-xs text-foreground">{t.action}</div>
                            <div className="text-xs text-muted-foreground">{t.by} · {t.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</h4>
                    <p className="text-xs text-foreground leading-relaxed">{dispute.description}</p>

                    {dispute.resolution && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2.5 text-xs text-green-600">
                        <span className="font-semibold">Resolution: </span>{dispute.resolution}
                      </div>
                    )}

                    {(dispute.status === 'Open' || dispute.status === 'Under Investigation') && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() => handleResolve(dispute.id)}
                          className="w-full btn-primary py-2 text-sm gap-2"
                        >
                          <CheckCircle size={15} />
                          Mark as Resolved
                        </button>
                        <button
                          onClick={() => handleEscalate(dispute.id)}
                          className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-600 border border-red-500/30 text-sm font-semibold hover:bg-red-500/20 transition-colors duration-150 flex items-center justify-center gap-2"
                        >
                          <AlertTriangle size={15} />
                          Escalate to Senior Review
                        </button>
                        <button className="w-full px-4 py-2 rounded-xl bg-muted text-foreground border border-border text-sm font-semibold hover:bg-muted/80 transition-colors duration-150 flex items-center justify-center gap-2">
                          <MessageSquare size={15} />
                          Contact TUCOR Support Team
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-sm text-muted-foreground">No disputes match your filters</div>
        )}
      </div>
    </div>
  );
}
