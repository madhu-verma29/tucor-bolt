'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle2, Banknote, ArrowDownToLine, Download, ChevronDown, ChevronUp, X, Building2, AlertCircle, Calendar,  } from 'lucide-react';
import { sellerApi, type SellerBankAccount, type SellerOrder, type SellerPayment } from '@/lib/seller-api';
import { downloadCsv } from '@/lib/download-csv';

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
  bank: SellerBankAccount;
  onClose: () => void;
  onSubmit: (amount:number,note:string)=>Promise<void>;
}

function WithdrawalModal({ availableBalance, bank, onClose, onSubmit }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const numAmount = parseFloat(amount) || 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (numAmount < 500) { setError('Minimum withdrawal is ₹500'); return; }
    if (numAmount > availableBalance) { setError('Amount exceeds available balance'); return; }
    setError('');
    try{await onSubmit(numAmount,note);setSubmitted(true)}catch(e){setError(e instanceof Error?e.message:'Unable to request withdrawal')}
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
                ₹{numAmount.toLocaleString('en-IN')} will be credited to your {bank.bankName} account within 2–3 business days.
              </p>
            </div>
            <div className="w-full bg-muted/60 rounded-xl p-4 text-left">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">₹{numAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium text-foreground">{bank.bankName} {bank.accountNumber}</span>
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
                  <p className="text-sm font-semibold text-foreground">{bank.bankName} — {bank.accountNumber}</p>
                  <p className="text-xs text-muted-foreground">{bank.accountHolder} · {bank.accountType} · {bank.ifsc}</p>
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
  const [payments,setPayments]=useState<SellerPayment[]>([]);const [orders,setOrders]=useState<SellerOrder[]>([]);const [bank,setBank]=useState<SellerBankAccount>({bankName:'',accountHolder:'',accountNumber:'',ifsc:'',accountType:'',branch:'',upiId:'',verified:false,verifiedAt:''});const [withdrawn,setWithdrawn]=useState(0);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(()=>{Promise.all([sellerApi.payments(),sellerApi.orders(),sellerApi.bankAccount(),sellerApi.withdrawals()]).then(([p,o,b,w])=>{setPayments(p);setOrders(o);setBank(b);setWithdrawn(w.filter(x=>x.status!=='Rejected').reduce((s,x)=>s+x.amount,0))}).catch(()=>{})},[]);
  const settlements:Settlement[]=payments.map((p)=>{const o=orders.find(x=>x.id===p.orderId);const gross=p.amount;const fee=Math.round(gross*.05);return{id:p.id,orderId:p.orderId,invoiceNo:p.invoiceNumber||'—',volume:o?.volumeLiters||0,pricePerLiter:o&&o.volumeLiters?Math.round(gross/o.volumeLiters):0,grossAmount:gross,platformFee:fee,netAmount:gross-fee,status:p.status==='Failed'||p.status==='Disputed'?'On Hold':p.status,settledDate:p.settledDate||null,dueDate:p.dueDate,reference:p.reference||'—'}});
  const pendingPayouts:PendingPayout[]=settlements.filter(s=>s.status!=='Settled').map(s=>({id:s.id,orderId:s.orderId,description:`UCO Collection — ${s.volume} L`,amount:s.netAmount,expectedDate:s.dueDate,stage:s.status}));
  const totalLifetime = settlements.filter(s=>s.status==='Settled').reduce((a,s)=>a+s.netAmount,0);
  const totalSettledThisMonth = totalLifetime;
  const totalPending = pendingPayouts.reduce((acc, p) => acc + p.amount, 0);
  const availableBalance = Math.max(0,totalSettledThisMonth-withdrawn);

  const statusFilters = ['All', 'Settled', 'Processing', 'Pending', 'On Hold'];
  const filtered = filterStatus === 'All' ? settlements : settlements.filter((s) => s.status === filterStatus);

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
          { label: 'Lifetime Earnings', value: `₹${totalLifetime.toLocaleString('en-IN')}`, sub: `${settlements.filter(s=>s.status==='Settled').length} collections total`, color: 'text-success', bg: 'bg-success-bg', icon: TrendingUp },
          { label: 'Settled This Month', value: `₹${totalSettledThisMonth.toLocaleString('en-IN')}`, sub: `${settlements.filter((s) => s.status === 'Settled').length} payments cleared`, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Pending Payouts', value: `₹${totalPending.toLocaleString('en-IN')}`, sub: `${pendingPayouts.length} orders in pipeline`, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
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
          <span className="ml-auto badge-pending text-xs">{pendingPayouts.length} pending</span>
        </div>
        <div className="divide-y divide-border">
          {pendingPayouts.map((payout) => (
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
              onClick={() => downloadCsv('seller-settlements.csv',[['Invoice','Order','Volume','Gross','Platform Fee','Net Payout','Status','Settled Date'],...filtered.map(s=>[s.invoiceNo,s.orderId,s.volume,s.grossAmount,s.platformFee,s.netAmount,s.status,s.settledDate])])}
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
                              <p className="font-semibold text-foreground">{bank.bankName} {bank.accountNumber}</p>
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
          bank={bank}
          onSubmit={async(amount,note)=>{await sellerApi.createWithdrawal(amount,note);setWithdrawn(x=>x+amount)}}
          onClose={() => setShowWithdrawal(false)}
        />
      )}
    </div>
  );
}
