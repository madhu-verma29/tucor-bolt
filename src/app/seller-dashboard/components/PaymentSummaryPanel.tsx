'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { sellerApi, type SellerPayment } from '@/lib/seller-api';

interface Props {
  onNavigate: (id: string) => void;
}

export default function PaymentSummaryPanel({ onNavigate }: Props) {
  const [paymentItems,setPaymentItems]=useState<SellerPayment[]>([]);useEffect(()=>{sellerApi.payments().then(setPaymentItems).catch(()=>setPaymentItems([]))},[]);
  const totalPending = paymentItems
    .filter((p) => p.status === 'Pending' || p.status === 'Processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSettled = paymentItems
    .filter((p) => p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-primary" />
          <h3 className="font-bold text-foreground text-sm">Payment Summary</h3>
        </div>
        <button
          onClick={() => onNavigate('payments')}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          Details <ArrowRight size={12} />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">Pending</div>
          <div className="font-mono-data font-bold text-warning text-lg">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">Settled</div>
          <div className="font-mono-data font-bold text-success text-lg">
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Payment list */}
      <div className="divide-y divide-border">
        {paymentItems.map((payment) => {
          const statusConfig = {
            Pending: { icon: Clock, className: 'text-warning', bg: 'bg-warning-bg' },
            Processing: { icon: Clock, className: 'text-info', bg: 'bg-info-bg' },
            Settled: { icon: CheckCircle2, className: 'text-success', bg: 'bg-success-bg' },
            Failed: { icon: AlertCircle, className: 'text-danger', bg: 'bg-danger-bg' },
            Disputed: { icon: AlertCircle, className: 'text-danger', bg: 'bg-danger-bg' },
          };
          const config = statusConfig[payment.status] || statusConfig.Pending;
          const StatusIcon = config.icon;

          return (
            <div key={`payment-item-${payment.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors duration-100">
              <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <StatusIcon size={13} className={config.className} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono-data text-xs font-semibold text-foreground truncate">{payment.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">
                  Due {payment.status === 'Settled' ? payment.settledDate : payment.dueDate}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`font-mono-data font-bold text-sm ${config.className}`}>
                  ₹{payment.amount.toLocaleString('en-IN')}
                </div>
                <div className={`text-xs font-medium ${config.className}`}>{payment.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
