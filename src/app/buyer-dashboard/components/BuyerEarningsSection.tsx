'use client';

import React, { useState } from 'react';
import {
  TrendingDown,
  Clock,
  CheckCircle2,
  Wallet,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface RefundRecord {
  id: string;
  orderId: string;
  invoiceNo: string;
  volumeLiters: number;
  pricePerLiter: number;
  grossPaid: number;
  refundAmount: number;
  netSpend: number;
  status: 'Credited' | 'Processing' | 'Pending' | 'Disputed';
  creditedDate: string | null;
  dueDate: string;
  reference: string;
}

interface PendingCredit {
  id: string;
  orderId: string;
  description: string;
  amount: number;
  expectedDate: string;
  stage: string;
}

const mockRefunds: RefundRecord[] = [
  {
    id: 'R001',
    orderId: 'ORD-2024-0891',
    invoiceNo: 'INV-2024-0891',
    volumeLiters: 180,
    pricePerLiter: 38,
    grossPaid: 6840,
    refundAmount: 342,
    netSpend: 6498,
    status: 'Credited',
    creditedDate: '14 Aug 2024',
    dueDate: '12 Aug 2024',
    reference: 'UTR9921049302',
  },
  {
    id: 'R002',
    orderId: 'ORD-2024-0876',
    invoiceNo: 'INV-2024-0876',
    volumeLiters: 220,
    pricePerLiter: 36,
    grossPaid: 7920,
    refundAmount: 396,
    netSpend: 7524,
    status: 'Credited',
    creditedDate: '07 Aug 2024',
    dueDate: '05 Aug 2024',
    reference: 'UTR9910293847',
  },
  {
    id: 'R003',
    orderId: 'ORD-2024-0862',
    invoiceNo: 'INV-2024-0862',
    volumeLiters: 150,
    pricePerLiter: 40,
    grossPaid: 6000,
    refundAmount: 300,
    netSpend: 5700,
    status: 'Processing',
    creditedDate: null,
    dueDate: '20 Aug 2024',
    reference: 'UTR9930192847',
  },
  {
    id: 'R004',
    orderId: 'ORD-2024-0849',
    invoiceNo: 'INV-2024-0849',
    volumeLiters: 300,
    pricePerLiter: 35,
    grossPaid: 10500,
    refundAmount: 525,
    netSpend: 9975,
    status: 'Credited',
    creditedDate: '30 Jul 2024',
    dueDate: '28 Jul 2024',
    reference: 'UTR9900192847',
  },
  {
    id: 'R005',
    orderId: 'ORD-2024-0835',
    invoiceNo: 'INV-2024-0835',
    volumeLiters: 90,
    pricePerLiter: 42,
    grossPaid: 3780,
    refundAmount: 189,
    netSpend: 3591,
    status: 'Pending',
    creditedDate: null,
    dueDate: '24 Aug 2024',
    reference: '—',
  },
  {
    id: 'R006',
    orderId: 'ORD-2024-0820',
    invoiceNo: 'INV-2024-0820',
    volumeLiters: 200,
    pricePerLiter: 37,
    grossPaid: 7400,
    refundAmount: 370,
    netSpend: 7030,
    status: 'Disputed',
    creditedDate: null,
    dueDate: '17 Aug 2024',
    reference: '—',
  },
];

const mockPendingCredits: PendingCredit[] = [
  {
    id: 'PC001',
    orderId: 'ORD-2024-0862',
    description: 'Overcharge Refund — Palm Oil 150 L',
    amount: 300,
    expectedDate: '20 Aug 2024',
    stage: 'TUCOR Verification',
  },
  {
    id: 'PC002',
    orderId: 'ORD-2024-0835',
    description: 'Quality Adjustment Credit — Sunflower 90 L',
    amount: 189,
    expectedDate: '24 Aug 2024',
    stage: 'Quality Check',
  },
  {
    id: 'PC003',
    orderId: 'ORD-2024-0820',
    description: 'Dispute Resolution Credit — Blended 200 L',
    amount: 370,
    expectedDate: 'On Hold',
    stage: 'Dispute Review',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusConfig(status: RefundRecord['status']) {
  const map: Record<RefundRecord['status'], { cls: string; icon: React.ElementType; color: string }> = {
    Credited: { cls: 'badge-active', icon: CheckCircle2, color: 'text-success' },
    Processing: { cls: 'badge-info', icon: Clock, color: 'text-info' },
    Pending: { cls: 'badge-pending', icon: Clock, color: 'text-warning' },
    Disputed: { cls: 'badge-danger', icon: AlertCircle, color: 'text-danger' },
  };
  return map[status] || map.Pending;
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

// ─── Expandable Row ───────────────────────────────────────────────────────────

function RefundRow({ record }: { record: RefundRecord }) {
  const [open, setOpen] = useState(false);
  const cfg = statusConfig(record.status);
  const StatusIcon = cfg.icon;

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors duration-100"
        onClick={() => setOpen((p) => !p)}
      >
        <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{record.orderId}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{record.invoiceNo}</td>
        <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{fmt(record.grossPaid)}</td>
        <td className="px-4 py-3 text-sm font-semibold text-success whitespace-nowrap">{fmt(record.refundAmount)}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
            <StatusIcon size={11} />
            {record.status}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {record.creditedDate ?? record.dueDate}
        </td>
        <td className="px-4 py-3 text-right">
          {open ? (
            <ChevronUp size={15} className="text-muted-foreground ml-auto" />
          ) : (
            <ChevronDown size={15} className="text-muted-foreground ml-auto" />
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/30 border-b border-border">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Volume</p>
                <p className="font-medium text-foreground">{record.volumeLiters} L</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Price / Litre</p>
                <p className="font-medium text-foreground">₹{record.pricePerLiter}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Net Spend</p>
                <p className="font-medium text-foreground">{fmt(record.netSpend)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">UTR / Reference</p>
                <p className="font-mono text-xs text-foreground">{record.reference}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BuyerEarningsSection() {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const totalCredited = mockRefunds
    .filter((r) => r.status === 'Credited')
    .reduce((s, r) => s + r.refundAmount, 0);

  const pendingTotal = mockPendingCredits.reduce((s, c) => s + c.amount, 0);

  const thisMonthCredited = mockRefunds
    .filter((r) => r.status === 'Credited' && r.creditedDate?.includes('Aug'))
    .reduce((s, r) => s + r.refundAmount, 0);

  const totalSpend = mockRefunds.reduce((s, r) => s + r.grossPaid, 0);

  const statuses = ['All', 'Credited', 'Processing', 'Pending', 'Disputed'];

  const filtered =
    filterStatus === 'All' ? mockRefunds : mockRefunds.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Earnings & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track credits, refunds, and pending payouts on your UCO purchases
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors duration-150">
          <Download size={15} />
          Export
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Credited</span>
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmt(totalCredited)}</p>
          <p className="text-xs text-muted-foreground mt-1">Lifetime refunds received</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-info/10 flex items-center justify-center">
              <ArrowUpRight size={16} className="text-info" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmt(thisMonthCredited)}</p>
          <p className="text-xs text-muted-foreground mt-1">Credits in August 2024</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Payouts</span>
            <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock size={16} className="text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmt(pendingTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockPendingCredits.length} credits in pipeline</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Spend</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingDown size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmt(totalSpend)}</p>
          <p className="text-xs text-muted-foreground mt-1">Gross procurement value</p>
        </div>
      </div>

      {/* Pending Payouts Panel */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
              <RefreshCw size={15} className="text-warning" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Pending Payouts</h2>
              <p className="text-xs text-muted-foreground">Credits awaiting processing</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-full">
            {mockPendingCredits.length} pending
          </span>
        </div>

        <div className="divide-y divide-border">
          {mockPendingCredits.map((credit) => (
            <div key={credit.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{credit.orderId}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {credit.stage}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{credit.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-success">{fmt(credit.amount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Expected: {credit.expectedDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Payout History</h2>
              <p className="text-xs text-muted-foreground">All refunds and credit adjustments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <div className="flex gap-1.5 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150 ${
                    filterStatus === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Paid</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credit / Refund</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <RefundRow key={record.id} record={record} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No records found for &quot;{filterStatus}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
