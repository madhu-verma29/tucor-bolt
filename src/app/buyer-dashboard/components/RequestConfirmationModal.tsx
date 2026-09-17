'use client';

import React, { useState } from 'react';
import { Shield, CheckCircle2, X, Lock, Truck, CreditCard, Clock, AlertTriangle,  } from 'lucide-react';
import { UCOMarketListing } from '@/lib/buyer-mock-data';

interface Props {
  listing: UCOMarketListing;
  requestedVolume: number;
  useCase: string;
  notes: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const useCaseLabels: Record<string, string> = {
  biodiesel: 'Biodiesel Production',
  industrial: 'Industrial Processing',
  animal_feed: 'Animal Feed Supplement',
  soap: 'Soap / Oleochemical',
  other: 'Other',
};

export default function RequestConfirmationModal({
  listing,
  requestedVolume,
  useCase,
  notes,
  onClose,
  onConfirm,
}: Props) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalEstimate = requestedVolume * listing.pricePerLiter;
  const platformFeeEstimate = Math.round(totalEstimate * 0.02);
  const totalWithFee = totalEstimate + platformFeeEstimate;

  const handleConfirm = async () => {
    if (!agreed) return;
    setSubmitting(true);
    await onConfirm();
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-card-lg w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Confirm UCO Request</h3>
              <p className="text-xs text-muted-foreground">TUCOR-Managed Transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Order summary */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Order Summary</div>
            <div className="rounded-xl border border-border overflow-hidden">
              {[
                { label: 'Oil Type & Grade', value: `${listing.oilType} UCO — Grade ${listing.gradeLabel}` },
                { label: 'Volume Requested', value: `${requestedVolume.toLocaleString('en-IN')} L` },
                { label: 'Source Location', value: `${listing.city}, ${listing.state}` },
                { label: 'Intended Use', value: useCaseLabels[useCase] || useCase || '—' },
                { label: 'Seller Reference', value: listing.sellerRef },
              ].map((item, i) => (
                <div
                  key={`summary-${item.label}`}
                  className={`flex justify-between items-center px-4 py-2.5 text-sm ${i < 4 ? 'border-b border-border' : ''}`}
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground text-right max-w-[55%]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Estimated Cost</div>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2.5 text-sm border-b border-border">
                <span className="text-muted-foreground">UCO Value ({requestedVolume} L × ₹{listing.pricePerLiter})</span>
                <span className="font-semibold text-foreground">₹{totalEstimate.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 text-sm border-b border-border">
                <span className="text-muted-foreground">Platform Fee (est. 2%)</span>
                <span className="font-semibold text-foreground">₹{platformFeeEstimate.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-primary/5">
                <span className="font-bold text-foreground text-sm">Estimated Total</span>
                <span className="font-extrabold text-primary text-base">₹{totalWithFee.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <AlertTriangle size={10} className="text-amber-500 flex-shrink-0" />
              Final pricing confirmed by TUCOR after matching. No payment due now.
            </p>
          </div>

          {/* TUCOR process guarantees */}
          <div className="rounded-xl bg-muted/40 border border-border p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">What Happens Next</div>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: Clock, color: 'text-amber-500', title: 'Review within 24–48 hrs', desc: 'TUCOR reviews your request and matches with the seller' },
                { icon: Lock, color: 'text-primary', title: 'Seller identity protected', desc: 'No direct contact — all communication via TUCOR' },
                { icon: Truck, color: 'text-blue-500', title: 'Logistics coordinated', desc: 'TUCOR schedules pickup and manages delivery to you' },
                { icon: CreditCard, color: 'text-emerald-500', title: 'Secure payment settlement', desc: 'Payment released to seller only after delivery confirmed' },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={`step-${step.title}`} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <StepIcon size={14} className={step.color} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes preview */}
          {notes && (
            <div className="rounded-xl border border-border px-4 py-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your Notes</div>
              <p className="text-xs text-foreground">{notes}</p>
            </div>
          )}

          {/* Terms agreement */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                agreed ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
              }`}
            >
              {agreed && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              I agree that TUCOR will manage this transaction end-to-end. I understand that seller details will remain confidential, and that final pricing and logistics will be confirmed by TUCOR before any commitment is made.
            </p>
          </label>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 btn-secondary text-sm py-2.5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!agreed || submitting}
            className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Shield size={14} />
                Submit to TUCOR
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
