'use client';

import React, { useEffect, useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  Shield,
  MapPin,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Truck,
  CreditCard,
  MessageSquare,
  X,
  TrendingUp,
} from 'lucide-react';
import { sellerApi, type SellerRequest as ApiSellerRequest } from '@/lib/seller-api';

type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review' | 'Expired';

interface BuyerRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  oilType: string;
  gradeLabel: 'A' | 'B' | 'C';
  volumeRequested: number;
  pricePerLiter: number;
  estimatedValue: number;
  buyerRef: string;
  useCase: string;
  notes?: string;
  status: RequestStatus;
  receivedAt: string;
  expiresAt: string;
  city: string;
  state: string;
  tucorNotes?: string;
}

const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Pending: { label: 'Pending Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  Approved: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle },
  'Under Review': { label: 'Under Review', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Eye },
  Expired: { label: 'Expired', color: 'text-muted-foreground', bg: 'bg-muted', icon: AlertCircle },
};

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  C: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  return `${hours}h left`;
}

interface ActionModalProps {
  request: BuyerRequest;
  action: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (id: string, action: 'approve' | 'reject', reason?: string) => void;
}

function ActionModal({ request, action, onClose, onConfirm }: ActionModalProps) {
  const [reason, setReason] = useState('');
  const isApprove = action === 'approve';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-card-lg w-full max-w-md overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-border ${isApprove ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isApprove ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {isApprove ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={18} className="text-red-600 dark:text-red-400" />}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{isApprove ? 'Approve Request' : 'Reject Request'}</h3>
            <p className="text-xs text-muted-foreground">{request.id} · {request.oilType} UCO</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-xl bg-muted/40 border border-border p-4 flex flex-col gap-2">
            {[
              { label: 'Buyer Ref', value: request.buyerRef },
              { label: 'Volume', value: `${request.volumeRequested} L` },
              { label: 'Estimated Value', value: `₹${request.estimatedValue.toLocaleString('en-IN')}` },
              { label: 'Use Case', value: request.useCase },
            ].map((item) => (
              <div key={`modal-${item.label}`} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          {isApprove ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Shield size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                TUCOR will coordinate the pickup logistics and payment settlement. You will receive a pickup schedule within 24 hours of approval.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Reason for Rejection <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Volume too small, listing already reserved, etc."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm outline-none focus:border-ring transition-colors resize-none placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">TUCOR will relay this reason to the buyer anonymously.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
          <button
            onClick={() => onConfirm(request.id, action, reason)}
            className={`flex-1 text-sm py-2.5 rounded-xl font-semibold transition-colors ${
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isApprove ? 'Approve & Notify TUCOR' : 'Reject Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RequestManagementSection() {
  const [requests, setRequests] = useState<ApiSellerRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'All' | RequestStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ request: ApiSellerRequest; action: 'approve' | 'reject' } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  useEffect(()=>{sellerApi.requests().then(setRequests).catch(e=>setToast({type:'error',message:e instanceof Error?e.message:'Unable to load requests'}))},[]);

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const filtered = requests.filter((r) => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.oilType.toLowerCase().includes(q) ||
      r.listingId.toLowerCase().includes(q) ||
      r.useCase.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try{const updated=await sellerApi.decideRequest(id,action,reason);setRequests(prev=>prev.map(r=>r.id===id?updated:r));setActionModal(null);setToast({message:action==='approve'?'Request approved. TUCOR will schedule pickup.':'Request rejected and buyer notified.',type:'success'})}catch(e){setActionModal(null);setToast({message:e instanceof Error?e.message:'Unable to update request',type:'error'})}
    setTimeout(() => setToast(null), 3500);
  };

  const kpis = [
    { label: 'Total Requests', value: requests.length, icon: Inbox, color: 'text-primary' },
    { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-500' },
    { label: 'Approved', value: requests.filter((r) => r.status === 'Approved').length, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Est. Revenue', value: `₹${requests.filter((r) => r.status === 'Approved').reduce((s, r) => s + r.estimatedValue, 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-blue-500' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all ${
          toast.type === 'success' ?'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' :'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-foreground">Request Management</h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Review and respond to buyer UCO procurement requests — all managed by TUCOR.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
          <Shield size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary">TUCOR-Managed</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <div key={`kpi-${kpi.label}`} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <KpiIcon size={18} className={kpi.color} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-foreground leading-tight">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TUCOR info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Shield size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">Your identity is protected</p>
          <p className="text-xs text-muted-foreground">
            Buyers cannot contact you directly. All requests are routed through TUCOR. You only need to approve or reject — TUCOR handles logistics, payment, and communication.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by request ID, oil type, use case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted-foreground" />
          {(['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const).map((s) => (
            <button
              key={`filter-${s}`}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="card p-10 flex flex-col items-center gap-3 text-center">
          <Inbox size={32} className="text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">No requests found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => {
            const cfg = statusConfig[req.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === req.id;
            const isPending = req.status === 'Pending';
            const timeLeft = getTimeLeft(req.expiresAt);

            return (
              <div
                key={`req-${req.id}`}
                className={`card overflow-hidden transition-all duration-200 ${isPending ? 'border-amber-200 dark:border-amber-800/50' : ''}`}
              >
                {/* Card header */}
                <div className="p-4 flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <StatusIcon size={16} className={cfg.color} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-foreground text-sm">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${gradeColors[req.gradeLabel]}`}>Grade {req.gradeLabel}</span>
                      {isPending && timeLeft !== 'Expired' && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock size={10} />
                          {timeLeft}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Package size={11} />{req.oilType} UCO · {req.volumeRequested} L</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{req.city}, {req.state}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(req.receivedAt)} at {formatTime(req.receivedAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-sm font-bold text-foreground">₹{req.estimatedValue.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-muted-foreground">@ ₹{req.pricePerLiter}/L</span>
                      <span className="text-xs text-muted-foreground">· {req.useCase}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPending && (
                      <>
                        <button
                          onClick={() => setActionModal({ request: req, action: 'reject' })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setActionModal({ request: req, action: 'approve' })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 flex flex-col gap-4 bg-muted/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Request details */}
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Request Details</div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { label: 'Listing', value: req.listingTitle },
                            { label: 'Listing ID', value: req.listingId },
                            { label: 'Buyer Ref', value: req.buyerRef },
                            { label: 'Expires', value: `${formatDate(req.expiresAt)} at ${formatTime(req.expiresAt)}` },
                          ].map((item) => (
                            <div key={`detail-${item.label}`} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-semibold text-foreground">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* TUCOR notes */}
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">TUCOR Assessment</div>
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2">
                          <Shield size={12} className="text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{req.tucorNotes || 'No additional notes from TUCOR.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Buyer notes */}
                    {req.notes && (
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <MessageSquare size={11} />
                          Buyer Notes
                        </div>
                        <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground">
                          {req.notes}
                        </div>
                      </div>
                    )}

                    {/* Process steps for approved */}
                    {req.status === 'Approved' && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <Truck size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">Pickup Being Scheduled</p>
                          <p className="text-xs text-muted-foreground">TUCOR is coordinating pickup logistics. You will receive a confirmed pickup date and time shortly. Ensure UCO is ready in sealed containers.</p>
                        </div>
                      </div>
                    )}

                    {req.status === 'Approved' && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <CreditCard size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Payment Settlement</p>
                          <p className="text-xs text-muted-foreground">₹{req.estimatedValue.toLocaleString('en-IN')} will be settled to your registered bank account within 3–5 business days after delivery confirmation.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <ActionModal
          request={actionModal.request}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onConfirm={handleAction}
        />
      )}
    </div>
  );
}
