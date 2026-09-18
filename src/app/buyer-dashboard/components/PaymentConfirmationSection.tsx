'use client';

import React, { useEffect, useState } from 'react';
import { buyerApi } from '@/lib/buyer-api';
import { CheckCircle2, Download, ShieldCheck, Phone, Mail, MapPin, Calendar, Package, Clock, Truck, CircleDot, Copy, Check, FileText, ArrowRight,  } from 'lucide-react';

interface PaymentConfirmationProps {
  onNavigate: (id: string) => void;
  orderId?: string;
  orderData?: {
    oilType: string;
    gradeLabel: string;
    volumeLiters: number;
    pricePerLiter: number;
    oilCost: number;
    transport: number;
    platformFee: number;
    gst: number;
    total: number;
    deliveryLocation: string;
    pickupDate: string;
    paymentMethod: string;
    transactionRef: string;
    paidAt: string;
  };
}

const TIMELINE_STEPS = [
  { label: 'Order Placed', description: 'Your order has been submitted to TUCOR', done: true, current: false },
  { label: 'Payment Confirmed', description: 'Payment received and verified by TUCOR', done: true, current: false },
  { label: 'Under TUCOR Review', description: 'TUCOR is reviewing and matching your order', done: false, current: true },
  { label: 'Seller Matched', description: 'A verified seller will be assigned', done: false, current: false },
  { label: 'Pickup Scheduled', description: 'Pickup date and agent will be assigned', done: false, current: false },
  { label: 'UCO Collected', description: 'UCO picked up from seller location', done: false, current: false },
  { label: 'Delivered to You', description: 'Delivered to your specified facility', done: false, current: false },
  { label: 'Order Completed', description: 'Order fully settled and closed', done: false, current: false },
];

export default function PaymentConfirmationSection({ onNavigate, orderId, orderData }: PaymentConfirmationProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false); const [liveOrder,setLiveOrder]=useState<any|null>(null); const [paymentStatus,setPaymentStatus]=useState(orderData?'Pending':'Pending');

  useEffect(()=>{if(orderData)return;Promise.all([buyerApi.payments(),buyerApi.orders(),buyerApi.profile()]).then(([ps,os,p])=>{const pay=orderId?ps.find(x=>x.orderId===orderId):ps[0];if(!pay)return;setPaymentStatus(pay.status);const o=os.find(x=>x.id===pay.orderId);if(!o)return;const oilCost=o.volumeLiters*o.pricePerLiter,transport=o.volumeLiters*1.2,platformFee=oilCost*0.015,gst=(oilCost+transport+platformFee)*0.18;setLiveOrder({id:o.id,oilType:o.oilType,gradeLabel:o.gradeLabel,volumeLiters:o.volumeLiters,pricePerLiter:o.pricePerLiter,oilCost,transport,platformFee,gst,total:pay.amount,deliveryLocation:[p.address,p.city,p.state,p.pincode].filter(Boolean).join(', '),pickupDate:o.pickupDate||'To be scheduled',paymentMethod:'TUCOR payment',transactionRef:pay.reference||pay.id,paidAt:pay.settledDate||'—'})}).catch(()=>{});},[orderId,orderData]);
  const displayOrderId = orderId ?? liveOrder?.id ?? '—';
  const order = orderData ?? liveOrder;

  if(!order){return <div className="card p-6 text-sm text-muted-foreground">No payment record is available yet.</div>;} 

  const settled=paymentStatus==='Settled'; const paymentTitle=settled?'Payment Confirmed':'Payment Initiated'; const paymentMessage=settled?'Your payment has been received and verified.':'Your payment request has been recorded and is awaiting provider verification.'; const timelineSteps=TIMELINE_STEPS.map((s,i)=>i===1?{...s,label:settled?'Payment Confirmed':'Payment Pending',description:settled?'Payment received and verified by TUCOR':'Awaiting payment-provider verification',done:settled,current:!settled}:i===2?{...s,current:settled}:s);
  const handleCopy = (text: string, type: 'id' | 'txn') => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
TUCOR PAYMENT RECORD
=====================
Order ID      : ${displayOrderId}
Transaction   : ${order.transactionRef}
Status        : ${paymentStatus}\nSettled At    : ${settled ? order.paidAt : 'Not settled'}
Payment Method: ${order.paymentMethod}

ORDER DETAILS
-------------
Oil Type      : ${order.oilType} UCO — Grade ${order.gradeLabel}
Volume        : ${order.volumeLiters} L
Price/Liter   : ₹${order.pricePerLiter}

INVOICE BREAKDOWN
-----------------
Oil Cost      : ₹${order.oilCost.toLocaleString('en-IN')}
Transport     : ₹${order.transport.toLocaleString('en-IN')}
Platform Fee  : ₹${order.platformFee.toLocaleString('en-IN')}
GST (18%)     : ₹${order.gst.toLocaleString('en-IN')}
─────────────────────
TOTAL AMOUNT  : ₹${order.total.toLocaleString('en-IN')}

PICKUP DETAILS
--------------
Pickup Date   : ${order.pickupDate}
Delivery To   : ${order.deliveryLocation}

TUCOR CONTACT
-------------
Phone         : 1800-TUCOR-01 (Toll Free)
Email         : support@tucor.in
Support Hours : Mon–Sat, 9 AM – 6 PM IST

This is a system-generated receipt. For disputes, quote your Order ID.
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TUCOR-Receipt-${displayOrderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* ── Success Banner ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-success/10 via-success/5 to-transparent border border-success/25 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center shrink-0">
          <CheckCircle2 size={30} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">{paymentTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {paymentMessage}
          </p>
        </div>
        <button
          onClick={handleDownloadReceipt}
          className="btn-secondary flex items-center gap-2 shrink-0 text-sm"
        >
          <Download size={15} />
          Download Payment Record
        </button>
      </div>

      {/* ── Order ID + Transaction Ref ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Order ID</p>
            <p className="text-base font-bold text-foreground font-mono">{displayOrderId}</p>
          </div>
          <button
            onClick={() => handleCopy(displayOrderId, 'id')}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Copy Order ID"
          >
            {copiedId ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          </button>
        </div>
        <div className="card p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Transaction Ref</p>
            <p className="text-base font-bold text-foreground font-mono">{order.transactionRef}</p>
          </div>
          <button
            onClick={() => handleCopy(order.transactionRef, 'txn')}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Copy Transaction Ref"
          >
            {copiedTxn ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left Column: Invoice + Pickup + Contact ─────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Invoice Breakdown */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Invoice Breakdown</h2>
            </div>
            <div className="space-y-0">
              {[
                { label: `${order.oilType} UCO (Grade ${order.gradeLabel}) × ${order.volumeLiters} L @ ₹${order.pricePerLiter}/L`, value: order.oilCost, muted: false },
                { label: 'Transport & Logistics', value: order.transport, muted: true },
                { label: 'TUCOR Platform Fee (1.5%)', value: order.platformFee, muted: true },
                { label: 'GST @ 18%', value: order.gst, muted: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                  <span className={`text-sm ${row.muted ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>{row.label}</span>
                  <span className={`text-sm font-semibold ${row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>
                    ₹{row.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="text-sm font-bold text-foreground">{settled ? 'Total Paid' : 'Payment Amount'}</span>
                <span className="text-lg font-bold text-success">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock size={12} />{settled ? `Settled: ${order.paidAt}` : `Status: ${paymentStatus}`}</span>
              <span className="flex items-center gap-1.5"><Package size={12} />Method: {order.paymentMethod}</span>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Pickup Details</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Scheduled Pickup Date</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{order.pickupDate}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">TUCOR logistics agent will coordinate directly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Delivery Destination</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{order.deliveryLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Pickup is managed end-to-end by TUCOR. You will receive an SMS/email notification 24 hours before the scheduled pickup.
                </p>
              </div>
            </div>
          </div>

          {/* TUCOR Contact */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">TUCOR Support Contact</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              All order coordination is managed by TUCOR. Seller identity is kept confidential per our platform policy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:18008826701"
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Toll-Free Helpline</p>
                  <p className="text-sm font-semibold text-foreground">1800-TUCOR-01</p>
                </div>
              </a>
              <a
                href="mailto:support@tucor.in"
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email Support</p>
                  <p className="text-sm font-semibold text-foreground">support@tucor.in</p>
                </div>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">Mon–Sat, 9 AM – 6 PM IST · Quote your Order ID for faster resolution</p>
          </div>
        </div>

        {/* ── Right Column: Order Timeline ────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card p-5 h-full">
            <div className="flex items-center gap-2 mb-5">
              <CircleDot size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Order Timeline</h2>
            </div>
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
              <div className="space-y-0">
                {timelineSteps.map((step, i) => (
                  <div key={step.label} className="relative flex items-start gap-3 pb-5 last:pb-0">
                    {/* Node */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      step.done
                        ? 'bg-success border-success'
                        : step.current
                        ? 'bg-primary border-primary animate-pulse' :'bg-card border-border'
                    }`}>
                      {step.done ? (
                        <Check size={13} className="text-white" />
                      ) : step.current ? (
                        <CircleDot size={13} className="text-white" />
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="pt-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${
                        step.done ? 'text-success' : step.current ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                        {step.current && (
                          <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">NOW</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-end pt-1">
        <button
          onClick={() => onNavigate('my-orders')}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Package size={15} />
          Track This Order
        </button>
        <button
          onClick={() => onNavigate('listings')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          Browse More Listings
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
