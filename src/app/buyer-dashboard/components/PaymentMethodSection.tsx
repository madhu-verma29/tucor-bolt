'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Info,
  Package,
  Truck,
  Receipt,
  Loader2,
  BadgeCheck,
  MapPin,
  Calendar,
} from 'lucide-react';

interface PaymentMethodSectionProps {
  onNavigate: (id: string) => void;
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
  };
}

type PaymentMethodId = 'upi' | 'netbanking' | 'card' | 'wallet';

interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  fields: PaymentField[];
}

interface PaymentField {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    label: 'UPI',
    description: 'Pay instantly using any UPI app',
    icon: Smartphone,
    badge: 'Instant',
    fields: [
      { id: 'upi_id', label: 'UPI ID', placeholder: 'yourname@upi', type: 'text', required: true },
    ],
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    description: 'Pay directly from your bank account',
    icon: Building2,
    fields: [
      { id: 'bank_name', label: 'Bank Name', placeholder: 'Select your bank', type: 'text', required: true },
      { id: 'account_number', label: 'Account Number', placeholder: 'Enter account number', type: 'text', required: true },
      { id: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. HDFC0001234', type: 'text', required: true },
    ],
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay accepted',
    icon: CreditCard,
    fields: [
      { id: 'card_number', label: 'Card Number', placeholder: '•••• •••• •••• ••••', type: 'text', required: true },
      { id: 'card_name', label: 'Name on Card', placeholder: 'As printed on card', type: 'text', required: true },
      { id: 'card_expiry', label: 'Expiry (MM/YY)', placeholder: 'MM/YY', type: 'text', required: true },
      { id: 'card_cvv', label: 'CVV', placeholder: '•••', type: 'password', required: true },
    ],
  },
  {
    id: 'wallet',
    label: 'Digital Wallet',
    description: 'Paytm, PhonePe, Amazon Pay',
    icon: Wallet,
    fields: [
      { id: 'wallet_provider', label: 'Wallet Provider', placeholder: 'e.g. Paytm', type: 'text', required: true },
      { id: 'wallet_mobile', label: 'Registered Mobile', placeholder: '+91 XXXXX XXXXX', type: 'tel', required: true },
    ],
  },
];

const DEFAULT_ORDER = {
  oilType: 'Palm',
  gradeLabel: 'A',
  volumeLiters: 480,
  pricePerLiter: 28,
  oilCost: 13440,
  transport: 576,
  platformFee: 202,
  gst: 2559,
  total: 16777,
  deliveryLocation: 'Navi Mumbai Plant — Plot 14, MIDC Industrial Area, Taloja, Navi Mumbai – 410208',
  pickupDate: '2026-09-18',
};

const SAVED_METHODS = [
  { id: 'saved-1', label: 'HDFC Bank — ••••4821', type: 'netbanking', icon: Building2 },
  { id: 'saved-2', label: 'arjun.mehta@okaxis', type: 'upi', icon: Smartphone },
];

export default function PaymentMethodSection({ onNavigate, orderData }: PaymentMethodSectionProps) {
  const order = orderData ?? DEFAULT_ORDER;

  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId>('upi');
  const [useSaved, setUseSaved] = useState<string | null>('saved-2');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [paymentError, setPaymentError] = useState('');

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId)!;

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[fieldId]; return n; });
    }
  };

  const validateFields = () => {
    if (useSaved) return true;
    const errors: Record<string, string> = {};
    for (const field of selectedMethod.fields) {
      if (field.required && !fieldValues[field.id]?.trim()) {
        errors[field.id] = `${field.label} is required`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async () => {
    if (!validateFields()) return;
    if (!agreedToTerms) {
      setPaymentError('Please agree to the payment terms to continue.');
      return;
    }
    setPaymentError('');
    setProcessing(true);
    setProcessingStep(1);

    // Simulate payment processing steps
    await new Promise((r) => setTimeout(r, 900));
    setProcessingStep(2);
    await new Promise((r) => setTimeout(r, 900));
    setProcessingStep(3);
    await new Promise((r) => setTimeout(r, 700));

    setProcessing(false);
    onNavigate('payment-confirmation');
  };

  const processingMessages = [
    '',
    'Verifying payment details…',
    'Initiating secure transaction…',
    'Confirming with payment gateway…',
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('create-order')}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Payment & Order Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Confirm your order details and complete payment securely</p>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 w-fit">
        <Lock size={13} className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">256-bit SSL encrypted · PCI-DSS compliant · Secured by TUCOR</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: Payment Method Selection ─────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Saved Payment Methods */}
          {SAVED_METHODS.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <BadgeCheck size={15} className="text-primary" />
                Saved Payment Methods
              </h2>
              <div className="flex flex-col gap-2">
                {SAVED_METHODS.map((saved) => {
                  const SavedIcon = saved.icon;
                  const isSelected = useSaved === saved.id;
                  return (
                    <button
                      key={saved.id}
                      onClick={() => { setUseSaved(saved.id); setPaymentError(''); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <SavedIcon size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                      <span className="text-sm font-medium flex-1">{saved.label}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
                <button
                  onClick={() => { setUseSaved(null); setPaymentError(''); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    useSaved === null
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-dashed border-border hover:border-primary/40 text-muted-foreground'
                  }`}
                >
                  <span className="text-sm font-medium">+ Use a new payment method</span>
                </button>
              </div>
            </div>
          )}

          {/* New Payment Method */}
          {useSaved === null && (
            <div className="card p-5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <CreditCard size={15} className="text-primary" />
                Select Payment Method
              </h2>

              {/* Method Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {PAYMENT_METHODS.map((method) => {
                  const MethodIcon = method.icon;
                  const isActive = selectedMethodId === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => { setSelectedMethodId(method.id); setFieldValues({}); setFieldErrors({}); }}
                      className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {method.badge && (
                        <span className="absolute -top-1.5 -right-1.5 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                          {method.badge}
                        </span>
                      )}
                      <MethodIcon size={20} />
                      <span className="text-xs font-semibold text-center leading-tight">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Description */}
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                <Info size={12} />
                {selectedMethod.description}
              </p>

              {/* Fields */}
              <div className="flex flex-col gap-3">
                {selectedMethod.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={fieldValues[field.id] ?? ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                        fieldErrors[field.id] ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {fieldErrors[field.id] && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {fieldErrors[field.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="card p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => { setAgreedToTerms(e.target.checked); setPaymentError(''); }}
                className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I confirm the order details above are correct and authorize TUCOR to process this payment of{' '}
                <span className="font-bold text-foreground">₹{order.total.toLocaleString('en-IN')}</span>. I agree to TUCOR's{' '}
                <span className="text-primary underline cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-primary underline cursor-pointer">Refund Policy</span>.
              </span>
            </label>
          </div>

          {/* Error */}
          {paymentError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {paymentError}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{processingMessages[processingStep]}</span>
              </>
            ) : (
              <>
                <Lock size={17} />
                <span>Pay ₹{order.total.toLocaleString('en-IN')} Securely</span>
                <ChevronRight size={17} />
              </>
            )}
          </button>

          {/* Processing Steps */}
          {processing && (
            <div className="flex items-center justify-center gap-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    processingStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {processingStep > step ? (
                      <CheckCircle2 size={14} />
                    ) : processingStep === step ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">{step}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground text-center leading-tight">
                    {step === 1 ? 'Verify' : step === 2 ? 'Initiate' : 'Confirm'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Order Summary Card */}
          <div className="card p-5 sticky top-6">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <Receipt size={15} className="text-primary" />
              Order Summary
            </h2>

            {/* Product */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package size={17} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{order.oilType} UCO — Grade {order.gradeLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.volumeLiters.toLocaleString('en-IN')} L @ ₹{order.pricePerLiter}/L</p>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin size={13} className="mt-0.5 flex-shrink-0 text-primary" />
                <span className="leading-relaxed">{order.deliveryLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar size={13} className="flex-shrink-0 text-primary" />
                <span>Est. Pickup: {order.pickupDate}</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-border pt-4 space-y-0">
              {[
                { label: 'Oil Cost', value: order.oilCost, muted: false },
                { label: 'Transport & Logistics', value: order.transport, muted: true },
                { label: 'Platform Fee (1.5%)', value: order.platformFee, muted: true },
                { label: 'GST @ 18%', value: order.gst, muted: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className={`text-xs ${row.muted ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>{row.label}</span>
                  <span className={`text-xs font-semibold ${row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>
                    ₹{row.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="text-sm font-bold text-foreground">Total Amount</span>
                <span className="text-xl font-bold text-primary">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              {[
                { icon: ShieldCheck, text: 'TUCOR-verified seller' },
                { icon: Truck, text: 'Managed logistics & pickup' },
                { icon: BadgeCheck, text: 'Quality-assured UCO' },
              ].map(({ icon: TrustIcon, text }) => {
                const TrustIconComponent = TrustIcon;
                return (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrustIconComponent size={13} className="text-emerald-500 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
