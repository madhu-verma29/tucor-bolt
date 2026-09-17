'use client';

import React, { useState } from 'react';
import { TrendingUp, Clock, CheckCircle2, Banknote, ArrowDownToLine, Download, ChevronDown, ChevronUp, X, Building2, AlertCircle, Calendar,  } from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Settlement {
  id: string;
  orderId: string;
  invoiceNo: string;
  volume: number;
  pricePerLiter: number;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'Settled' | 'Processing' | 'Pending' | 'On Hold';
  settledDate: string | null;
  dueDate: string;
  reference: string;
}

interface PendingPayout {
  id: string;
  orderId: string;
  description: string;
  amount: number;
  expectedDate: string;
  stage: string;
}

const mockSettlements: Settlement[] = [
  { id: 'S001', orderId: 'ORD-2024-0891', invoiceNo: 'INV-2024-0891', volume: 180, pricePerLiter: 38, grossAmount: 6840, platformFee: 342, netAmount: 6498, status: 'Settled', settledDate: '12 Aug 2024', dueDate: '10 Aug 2024', reference: 'UTR8821049302' },
  { id: 'S002', orderId: 'ORD-2024-0876', invoiceNo: 'INV-2024-0876', volume: 220, pricePerLiter: 36, grossAmount: 7920, platformFee: 396, netAmount: 7524, status: 'Settled', settledDate: '05 Aug 2024', dueDate: '03 Aug 2024', reference: 'UTR8810293847' },
  { id: 'S003', orderId: 'ORD-2024-0862', invoiceNo: 'INV-2024-0862', volume: 150, pricePerLiter: 40, grossAmount: 6000, platformFee: 300, netAmount: 5700, status: 'Processing', settledDate: null, dueDate: '18 Aug 2024', reference: 'UTR8830192847' },
  { id: 'S004', orderId: 'ORD-2024-0849', invoiceNo: 'INV-2024-0849', volume: 300, pricePerLiter: 35, grossAmount: 10500, platformFee: 525, netAmount: 9975, status: 'Settled', settledDate: '28 Jul 2024', dueDate: '26 Jul 2024', reference: 'UTR8800192847' },
  { id: 'S005', orderId: 'ORD-2024-0835', invoiceNo: 'INV-2024-0835', volume: 90, pricePerLiter: 42, grossAmount: 3780, platformFee: 189, netAmount: 3591, status: 'Pending', settledDate: null, dueDate: '22 Aug 2024', reference: '—' },
  { id: 'S006', orderId: 'ORD-2024-0820', invoiceNo: 'INV-2024-0820', volume: 200, pricePerLiter: 37, grossAmount: 7400, platformFee: 370, netAmount: 7030, status: 'On Hold', settledDate: null, dueDate: '15 Aug 2024', reference: '—' },
];

const mockPendingPayouts: PendingPayout[] = [
  { id: 'PP001', orderId: 'ORD-2024-0862', description: 'Palm Oil Collection — 150 L', amount: 5700, expectedDate: '18 Aug 2024', stage: 'TUCOR Verification' },
  { id: 'PP002', orderId: 'ORD-2024-0835', description: 'Sunflower Oil Collection — 90 L', amount: 3591, expectedDate: '22 Aug 2024', stage: 'Quality Check' },
  { id: 'PP003', orderId: 'ORD-2024-0820', description: 'Blended Oil Collection — 200 L', amount: 7030, expectedDate: 'On Hold', stage: 'Dispute Review' },
];

const savedBankAccount = {
  bankName: 'HDFC Bank',
  accountHolder: 'Priya Nambiar',
  accountNumber: '****  ****  4821',
  ifsc: 'HDFC0001234',
  accountType: 'Current',
};

// ─── Status Config ────────────────────────────────────────────────────────────

function statusConfig(status: Settlement['status']) {
  const map = {
    Settled: { cls: 'badge-active', icon: CheckCircle2, color: 'text-success' },
    Processing: { cls: 'badge-info', icon: Clock, color: 'text-info' },
    Pending: { cls: 'badge-pending', icon: Clock, color: 'text-warning' },
    'On Hold': { cls: 'badge-danger', icon: AlertCircle, color: 'text-danger' },
  };
  return map[status] || map.Pending;
}

// ─── Withdrawal Modal ─────────────────────────────────────────────────────────

interface WithdrawalModalProps {
  availableBalance: number;
  onClose: () => void;
}

function WithdrawalModal({ availableBalance, onClose }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const numAmount = parseFloat(amount) || 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (numAmount < 500) { setError('Minimum withdrawal is ₹500'); return; }
    if (numAmount > availableBalance) { setError('Amount exceeds available balance'); return; }
    setError('');
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success-bg flex items-center justify-center">
              <ArrowDownToLine size={16} className="text-success" />
            </div>
            <h3 className="font-bold text-foreground text-base">Request Withdrawal</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-success-bg flex items-center justify-center">
              <CheckCircle2 size={28} className="text-success" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">Withdrawal Requested!</p>
              <p className="text-sm text-muted-foreground mt-1">
                ₹{numAmount.toLocaleString('en-IN')} will be credited to your {savedBankAccount.bankName} account within 2–3 business days.
              </p>
            </div>
            <div className="w-full bg-muted/60 rounded-xl p-4 text-left">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">₹{numAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium text-foreground">{savedBankAccount.bankName} {savedBankAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Expected</span>
                <span className="font-medium text-foreground">2–3 business days</span>
              </div>
            </div>
            <button onClick={onClose} className="btn-primary w-full py-2.5 text-sm">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
            {/* Available balance */}
            <div className="bg-success-bg/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Available Balance</span>
              <span className="font-mono-data font-bold text-success text-lg">₹{availableBalance.toLocaleString('en-IN')}</span>
            </div>

            {/* Bank account */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Destination Account</label>
              <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-muted/40">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{savedBankAccount.bankName} — {savedBankAccount.accountNumber}</p>
                  <p className="text-xs text-muted-foreground">{savedBankAccount.accountHolder} · {savedBankAccount.accountType} · {savedBankAccount.ifsc}</p>
                </div>
                <span className="badge-active text-xs flex-shrink-0">Primary</span>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Withdrawal Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={500}
                  max={availableBalance}
                  step={1}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(String(Math.min(preset, availableBalance))); setError(''); }}
                    className="text-xs px-3 py-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setAmount(String(availableBalance)); setError(''); }}
                  className="text-xs px-3 py-1 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                >
                  Max
                </button>
              </div>
              {error && <p className="text-xs text-danger mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. August settlement withdrawal"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
              Funds will be transferred to your registered bank account within <strong>2–3 business days</strong>. Minimum withdrawal: ₹500. Platform fee: 0%.
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">Confirm Withdrawal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function SellerEarningsSection() {
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const totalLifetime = 278400;
  const totalSettledThisMonth = mockSettlements.filter((s) => s.status === 'Settled').reduce((acc, s) => acc + s.netAmount, 0);
  const totalPending = mockPendingPayouts.reduce((acc, p) => acc + p.amount, 0);
  const availableBalance = totalSettledThisMonth;

  const statusFilters = ['All', 'Settled', 'Processing', 'Pending', 'On Hold'];
  const filtered = filterStatus === 'All' ? mockSettlements : mockSettlements.filter((s) => s.status === filterStatus);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Earnings & Payouts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track your UCO collection earnings, pending settlements, and withdraw funds</p>
        </div>
        <button
          onClick={() => setShowWithdrawal(true)}
          className="btn-primary gap-2 py-2.5 px-5 text-sm self-start sm:self-auto"
        >
          <ArrowDownToLine size={15} />
          Request Withdrawal
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lifetime Earnings', value: `₹${totalLifetime.toLocaleString('en-IN')}`, sub: '67 collections total', color: 'text-success', bg: 'bg-success-bg', icon: TrendingUp },
          { label: 'Settled This Month', value: `₹${totalSettledThisMonth.toLocaleString('en-IN')}`, sub: `${mockSettlements.filter((s) => s.status === 'Settled').length} payments cleared`, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Pending Payouts', value: `₹${totalPending.toLocaleString('en-IN')}`, sub: `${mockPendingPayouts.length} orders in pipeline`, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'Available to Withdraw', value: `₹${availableBalance.toLocaleString('en-IN')}`, sub: 'Ready for bank transfer', color: 'text-primary', bg: 'bg-primary/10', icon: Banknote },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={`earn-stat-${stat.label}`} className="card p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <StatIcon size={16} className={stat.color} />
              </div>
              <div className={`font-mono-data text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs font-medium text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Pending Payouts */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Clock size={16} className="text-warning" />
          <h3 className="font-bold text-foreground text-base">Pending Payouts</h3>
          <span className="ml-auto badge-pending text-xs">{mockPendingPayouts.length} pending</span>
        </div>
        <div className="divide-y divide-border">
          {mockPendingPayouts.map((payout) => (
            <div key={`payout-${payout.id}`} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-data text-xs font-semibold text-muted-foreground">{payout.orderId}</span>
                  <span className="badge-info text-xs">{payout.stage}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{payout.description}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Calendar size={11} />
                  Expected: {payout.expectedDate}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono-data font-bold text-warning text-lg">₹{payout.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-muted-foreground">Net payout</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlement History */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base">Settlement History</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1">
              {statusFilters.map((f) => (
                <button
                  key={`filter-${f}`}
                  onClick={() => setFilterStatus(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    filterStatus === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => {}}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Invoice', 'Order ID', 'Volume', 'Gross', 'Platform Fee', 'Net Payout', 'Status', 'Settled Date', ''].map((h) => (
                  <th key={`col-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const cfg = statusConfig(s.status);
                const StatusIcon = cfg.icon;
                const isExpanded = expandedRow === s.id;
                return (
                  <React.Fragment key={`settle-${s.id}`}>
                    <tr
                      className="hover:bg-muted/40 transition-colors duration-100 cursor-pointer group"
                      onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-xs font-semibold text-foreground">{s.invoiceNo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-xs text-muted-foreground">{s.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{s.volume} L</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-xs text-foreground">₹{s.grossAmount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-xs text-danger">−₹{s.platformFee.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono-data font-bold text-sm ${cfg.color}`}>₹{s.netAmount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cfg.cls}>
                          <StatusIcon size={11} />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{s.settledDate || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-0.5">Price per Liter</p>
                              <p className="font-semibold text-foreground">₹{s.pricePerLiter}/L</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Due Date</p>
                              <p className="font-semibold text-foreground">{s.dueDate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">UTR / Reference</p>
                              <p className="font-mono-data font-semibold text-foreground">{s.reference}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Bank Account</p>
                              <p className="font-semibold text-foreground">{savedBankAccount.bankName} {savedBankAccount.accountNumber}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No settlements found for this filter.</div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawal && (
        <WithdrawalModal
          availableBalance={availableBalance}
          onClose={() => setShowWithdrawal(false)}
        />
      )}
    </div>
  );
}
