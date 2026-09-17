'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, CreditCard, Phone, Settings2, CheckCircle2, Clock, AlertCircle, XCircle, Edit3, Save, X, Eye, EyeOff, Upload, ChevronRight, MapPin, Info, RefreshCw, Hash, Landmark, Plus, Trash2, ToggleLeft, ToggleRight, Mail, MessageSquare, Star,  } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = 'verified' | 'pending' | 'under_review' | 'rejected' | 'not_submitted';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function VerificationBadge({ status, label }: { status: VerificationStatus; label?: string }) {
  const map: Record<VerificationStatus, { cls: string; icon: React.ReactNode; text: string }> = {
    verified: { cls: 'badge-active', icon: <CheckCircle2 size={12} />, text: label ?? 'Verified' },
    pending: { cls: 'badge-pending', icon: <Clock size={12} />, text: label ?? 'Pending' },
    under_review: { cls: 'badge-info', icon: <RefreshCw size={12} />, text: label ?? 'Under Review' },
    rejected: { cls: 'badge-danger', icon: <XCircle size={12} />, text: label ?? 'Rejected' },
    not_submitted: { cls: 'badge-muted', icon: <AlertCircle size={12} />, text: label ?? 'Not Submitted' },
  };
  const { cls, icon, text } = map[status];
  return (
    <span className={`${cls} inline-flex items-center gap-1`}>
      {icon}
      {text}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-6 mb-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

// ─── Tab: Company Details ──────────────────────────────────────────────────────

function CompanyDetailsTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: 'BioFuel India Pvt. Ltd.',
    tradeName: 'BioFuel India',
    businessType: 'Private Limited Company',
    category: 'Biodiesel Manufacturer',
    pan: 'AABCB1234C',
    cin: 'U24100MH2018PTC312345',
    yearEstablished: '2018',
    website: 'www.biofuelindia.in',
    address: '22, MIDC Industrial Area, Taloja Phase II',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '410208',
    country: 'India',
  });

  const handleChange = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      <SectionCard
        title="Registered Business Information"
        subtitle="Legal entity details as per government registration"
        action={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
                <X size={13} />Cancel
              </button>
              <button onClick={() => setEditing(false)} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
                <Save size={13} />Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Edit3 size={13} />Edit
            </button>
          )
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'businessName', label: 'Registered Business Name' },
              { key: 'tradeName', label: 'Trade / Brand Name' },
              { key: 'businessType', label: 'Business Type' },
              { key: 'category', label: 'Business Category' },
              { key: 'pan', label: 'PAN Number' },
              { key: 'cin', label: 'CIN / LLPIN' },
              { key: 'yearEstablished', label: 'Year Established' },
              { key: 'website', label: 'Website' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input
                  className="input-field"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="Registered Business Name" value={form.businessName} />
            <Field label="Trade / Brand Name" value={form.tradeName} />
            <Field label="Business Type" value={form.businessType} />
            <Field label="Business Category" value={form.category} />
            <Field label="PAN Number" value={form.pan} mono />
            <Field label="CIN / LLPIN" value={form.cin} mono />
            <Field label="Year Established" value={form.yearEstablished} />
            <Field label="Website" value={form.website} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Registered Address"
        subtitle="Primary business address for procurement correspondence"
        action={
          !editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Edit3 size={13} />Edit
            </button>
          ) : null
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'address', label: 'Street Address', full: true },
              { key: 'city', label: 'City' },
              { key: 'state', label: 'State' },
              { key: 'pincode', label: 'PIN Code' },
              { key: 'country', label: 'Country' },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? 'sm:col-span-2' : ''}>
                <label className="label-text">{label}</label>
                <input
                  className="input-field"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{form.address}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {form.city}, {form.state} – {form.pincode}
              </div>
              <div className="text-sm text-muted-foreground">{form.country}</div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: KYC / Verification ──────────────────────────────────────────────────

interface DocRowProps {
  icon: React.ReactNode;
  title: string;
  number: string;
  status: VerificationStatus;
  expiry?: string;
  submittedOn?: string;
  note?: string;
}

function DocRow({ icon, title, number, status, expiry, submittedOn, note }: DocRowProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors duration-150 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">{number}</div>
        </div>
        <VerificationBadge status={status} />
        <ChevronRight
          size={16}
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {submittedOn && <Field label="Submitted On" value={submittedOn} />}
            {expiry && <Field label="Valid Until" value={expiry} />}
            <Field
              label="Verification Status"
              value={status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            />
          </div>
          {note && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 mb-4">
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              {note}
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Upload size={13} />Re-upload Document
            </button>
            <button className="btn-ghost text-xs px-3 py-1.5 gap-1.5">
              <Eye size={13} />View Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KYCVerificationTab() {
  return (
    <div>
      {/* Trust Score */}
      <div className="card p-5 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-1">TUCOR Buyer Trust Score</div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary font-mono">82</span>
              <span className="text-muted-foreground text-sm mb-1">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on KYC completeness, procurement history, and compliance standing
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            {[
              { label: 'GST Registration Verified', done: true },
              { label: 'Business PAN Verified', done: true },
              { label: 'Bank Account Linked', done: true },
              { label: 'Director KYC', done: false },
              { label: 'End-Use Declaration', done: false },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                {done ? (
                  <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                ) : (
                  <AlertCircle size={13} className="text-warning flex-shrink-0" />
                )}
                <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Verification Progress</span>
            <span>3 of 5 complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>

      <SectionCard
        title="KYC & Compliance Documents"
        subtitle="Required documents for buyer verification and procurement eligibility"
      >
        <DocRow
          icon={<Hash size={16} className="text-primary" />}
          title="GST Registration Certificate"
          number="27AABCB1234C1ZW"
          status="verified"
          submittedOn="18 Feb 2026"
          expiry="Lifetime (Annual Filing)"
        />
        <DocRow
          icon={<Building2 size={16} className="text-primary" />}
          title="Business PAN Card"
          number="AABCB1234C"
          status="verified"
          submittedOn="18 Feb 2026"
        />
        <DocRow
          icon={<ShieldCheck size={16} className="text-primary" />}
          title="End-Use Declaration (UCO)"
          number="—"
          status="not_submitted"
          note="Upload a signed end-use declaration confirming UCO will be used for biodiesel production or approved industrial purposes."
        />
        <DocRow
          icon={<Building2 size={16} className="text-primary" />}
          title="Director / Authorized Signatory KYC"
          number="—"
          status="pending"
          submittedOn="05 Sep 2026"
          note="Your KYC documents are under review by the TUCOR compliance team. Expected completion: 2–3 business days."
        />
      </SectionCard>

      <SectionCard title="Verification Timeline" subtitle="History of your compliance submissions and approvals">
        <div className="space-y-3">
          {[
            {
              date: '18 Feb 2026',
              event: 'GST Certificate verified by TUCOR compliance team',
              status: 'verified' as VerificationStatus,
            },
            {
              date: '18 Feb 2026',
              event: 'Business PAN verified and linked to buyer account',
              status: 'verified' as VerificationStatus,
            },
            {
              date: '05 Sep 2026',
              event: 'Director KYC submitted — under review',
              status: 'under_review' as VerificationStatus,
            },
          ].map(({ date, event, status }, index) => (
            <div key={index} className="flex items-start gap-3">
              <VerificationBadge status={status} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{event}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{date}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Payment Methods ─────────────────────────────────────────────────────

interface PaymentCard {
  id: string;
  type: 'bank' | 'card';
  label: string;
  detail: string;
  masked: string;
  verified: boolean;
  primary: boolean;
}

function PaymentMethodsTab() {
  const [showFull, setShowFull] = useState<string | null>(null);
  const [methods] = useState<PaymentCard[]>([
    {
      id: 'pm-1',
      type: 'bank',
      label: 'HDFC Bank — Current Account',
      detail: 'IFSC: HDFC0002345 · Branch: Vashi, Navi Mumbai',
      masked: '•••• •••• 7890',
      verified: true,
      primary: true,
    },
    {
      id: 'pm-2',
      type: 'bank',
      label: 'ICICI Bank — Current Account',
      detail: 'IFSC: ICIC0001122 · Branch: Belapur, Navi Mumbai',
      masked: '•••• •••• 4321',
      verified: true,
      primary: false,
    },
    {
      id: 'pm-3',
      type: 'card',
      label: 'HDFC Corporate Credit Card',
      detail: 'Visa · Expires 08/2027',
      masked: '•••• •••• •••• 5566',
      verified: false,
      primary: false,
    },
  ]);

  return (
    <div>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-6 text-xs text-primary">
        <Info size={13} className="flex-shrink-0" />
        Payment methods are used for UCO procurement transactions. All payments are processed securely through TUCOR's escrow system.
      </div>

      <SectionCard
        title="Saved Payment Methods"
        subtitle="Bank accounts and cards used for procurement payments"
        action={
          <button className="btn-primary text-xs px-3 py-1.5 gap-1.5">
            <Plus size={13} />Add Method
          </button>
        }
      >
        <div className="space-y-3">
          {methods.map((m) => (
            <div key={m.id} className="border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                {m.type === 'bank' ? (
                  <Landmark size={16} className="text-primary" />
                ) : (
                  <CreditCard size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{m.label}</span>
                  {m.primary && (
                    <span className="badge-active text-xs inline-flex items-center gap-1">
                      <Star size={10} />Primary
                    </span>
                  )}
                  {m.verified ? (
                    <span className="badge-active text-xs inline-flex items-center gap-1">
                      <CheckCircle2 size={10} />Verified
                    </span>
                  ) : (
                    <span className="badge-pending text-xs inline-flex items-center gap-1">
                      <Clock size={10} />Unverified
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.detail}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-foreground">
                    {showFull === m.id ? m.masked.replace(/•/g, '9') : m.masked}
                  </span>
                  <button
                    onClick={() => setShowFull(showFull === m.id ? null : m.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showFull === m.id ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!m.primary && (
                  <button className="btn-ghost text-xs px-2.5 py-1.5">Set Primary</button>
                )}
                <button className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent Payment Activity" subtitle="Last 5 procurement payment transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Date</th>
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Order Ref</th>
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Method</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3">Amount</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { date: '08 Sep 2026', ref: 'ORD-2026-0891', method: 'HDFC ••7890', amount: '₹1,84,500', status: 'Settled' },
                { date: '02 Sep 2026', ref: 'ORD-2026-0834', method: 'HDFC ••7890', amount: '₹2,12,000', status: 'Settled' },
                { date: '25 Aug 2026', ref: 'ORD-2026-0779', method: 'ICICI ••4321', amount: '₹98,750', status: 'Settled' },
                { date: '18 Aug 2026', ref: 'ORD-2026-0712', method: 'HDFC ••7890', amount: '₹3,45,200', status: 'Settled' },
                { date: '10 Aug 2026', ref: 'ORD-2026-0655', method: 'HDFC ••7890', amount: '₹1,67,800', status: 'Settled' },
              ].map((row) => (
                <tr key={row.ref}>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">{row.date}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-foreground">{row.ref}</td>
                  <td className="py-3 pr-4 text-xs text-foreground">{row.method}</td>
                  <td className="py-3 text-right font-semibold text-xs text-foreground">{row.amount}</td>
                  <td className="py-3 pl-4 text-right">
                    <span className="badge-active text-xs">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Contact Info ────────────────────────────────────────────────────────

function ContactInfoTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    primaryName: 'Arjun Mehta',
    primaryRole: 'Procurement Manager',
    primaryPhone: '+91 98765 43210',
    primaryEmail: 'arjun.mehta@biofuelindia.in',
    altName: 'Priya Sharma',
    altRole: 'Finance Controller',
    altPhone: '+91 87654 32109',
    altEmail: 'priya.sharma@biofuelindia.in',
    warehouseAddress: 'Plot 22, MIDC Taloja Phase II, Navi Mumbai – 410208',
    warehouseContact: '+91 22 2741 5500',
    warehouseHours: 'Mon–Sat, 08:00–18:00',
  });

  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <SectionCard
        title="Primary Contact"
        subtitle="Main point of contact for procurement and order coordination"
        action={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
                <X size={13} />Cancel
              </button>
              <button onClick={() => setEditing(false)} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
                <Save size={13} />Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Edit3 size={13} />Edit
            </button>
          )
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'primaryName', label: 'Full Name' },
              { key: 'primaryRole', label: 'Designation / Role' },
              { key: 'primaryPhone', label: 'Phone Number' },
              { key: 'primaryEmail', label: 'Email Address' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input
                  className="input-field"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {form.primaryName.charAt(0)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
              <Field label="Full Name" value={form.primaryName} />
              <Field label="Designation" value={form.primaryRole} />
              <Field label="Phone" value={form.primaryPhone} />
              <Field label="Email" value={form.primaryEmail} />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Alternate Contact"
        subtitle="Secondary contact for escalations and finance queries"
        action={
          !editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Edit3 size={13} />Edit
            </button>
          ) : null
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'altName', label: 'Full Name' },
              { key: 'altRole', label: 'Designation / Role' },
              { key: 'altPhone', label: 'Phone Number' },
              { key: 'altEmail', label: 'Email Address' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input
                  className="input-field"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {form.altName.charAt(0)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
              <Field label="Full Name" value={form.altName} />
              <Field label="Designation" value={form.altRole} />
              <Field label="Phone" value={form.altPhone} />
              <Field label="Email" value={form.altEmail} />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Warehouse / Delivery Location"
        subtitle="Address where UCO deliveries will be received"
        action={
          !editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Edit3 size={13} />Edit
            </button>
          ) : null
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'warehouseAddress', label: 'Warehouse Address', full: true },
              { key: 'warehouseContact', label: 'Contact Number' },
              { key: 'warehouseHours', label: 'Operating Hours' },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? 'sm:col-span-2' : ''}>
                <label className="label-text">{label}</label>
                <input
                  className="input-field"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{form.warehouseAddress}</div>
              <div className="text-sm text-muted-foreground mt-1">
                📞 {form.warehouseContact} · 🕐 {form.warehouseHours}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Preferences ─────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <button onClick={onToggle} className="flex-shrink-0">
        {enabled ? (
          <ToggleRight size={28} className="text-primary" />
        ) : (
          <ToggleLeft size={28} className="text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function PreferencesTab() {
  const [prefs, setPrefs] = useState({
    emailOrders: true,
    emailPayments: true,
    emailKYC: true,
    smsOrders: true,
    smsPickups: false,
    whatsappUpdates: true,
    autoReorder: false,
    priceAlerts: true,
    weeklyReport: true,
    sustainabilityReport: false,
    darkMode: false,
    compactView: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const [oilPrefs, setOilPrefs] = useState({
    preferredGrade: 'Grade A',
    maxFFA: '3%',
    minVolume: '500 L',
    maxPrice: '₹55/L',
    preferredRegions: 'Maharashtra, Gujarat',
    currency: 'INR',
    language: 'English',
  });

  const handleOilChange = (k: string, v: string) => setOilPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <SectionCard title="Notification Preferences" subtitle="Control how TUCOR communicates with you">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={14} className="text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
          </div>
          <ToggleRow
            label="Order Updates"
            description="Confirmation, dispatch, and delivery notifications"
            enabled={prefs.emailOrders}
            onToggle={() => toggle('emailOrders')}
          />
          <ToggleRow
            label="Payment Confirmations"
            description="Receipts and settlement notifications"
            enabled={prefs.emailPayments}
            onToggle={() => toggle('emailPayments')}
          />
          <ToggleRow
            label="KYC & Compliance Alerts"
            description="Document expiry and verification status updates"
            enabled={prefs.emailKYC}
            onToggle={() => toggle('emailKYC')}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={14} className="text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SMS</span>
          </div>
          <ToggleRow
            label="Order Status SMS"
            description="Critical order updates via SMS"
            enabled={prefs.smsOrders}
            onToggle={() => toggle('smsOrders')}
          />
          <ToggleRow
            label="Pickup Reminders"
            description="Reminders before scheduled UCO pickups"
            enabled={prefs.smsPickups}
            onToggle={() => toggle('smsPickups')}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</span>
          </div>
          <ToggleRow
            label="WhatsApp Order Updates"
            description="Real-time order tracking via WhatsApp"
            enabled={prefs.whatsappUpdates}
            onToggle={() => toggle('whatsappUpdates')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Procurement Preferences" subtitle="Default settings for UCO sourcing and search filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'preferredGrade', label: 'Preferred UCO Grade' },
            { key: 'maxFFA', label: 'Max Acceptable FFA %' },
            { key: 'minVolume', label: 'Minimum Order Volume' },
            { key: 'maxPrice', label: 'Max Price per Litre' },
            { key: 'preferredRegions', label: 'Preferred Sourcing Regions', full: true },
          ].map(({ key, label, full }) => (
            <div key={key} className={full ? 'sm:col-span-2' : ''}>
              <label className="label-text">{label}</label>
              <input
                className="input-field"
                value={oilPrefs[key as keyof typeof oilPrefs]}
                onChange={(e) => handleOilChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary text-xs px-4 py-2 gap-1.5">
            <Save size={13} />Save Preferences
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Platform Preferences" subtitle="Display and reporting settings">
        <ToggleRow
          label="Price Alerts"
          description="Get notified when UCO prices drop below your max price threshold"
          enabled={prefs.priceAlerts}
          onToggle={() => toggle('priceAlerts')}
        />
        <ToggleRow
          label="Weekly Procurement Report"
          description="Receive a weekly summary of your procurement activity"
          enabled={prefs.weeklyReport}
          onToggle={() => toggle('weeklyReport')}
        />
        <ToggleRow
          label="Sustainability Impact Report"
          description="Monthly CO₂ offset and circular economy contribution report"
          enabled={prefs.sustainabilityReport}
          onToggle={() => toggle('sustainabilityReport')}
        />
        <ToggleRow
          label="Compact Dashboard View"
          description="Show more data with reduced card spacing"
          enabled={prefs.compactView}
          onToggle={() => toggle('compactView')}
        />
      </SectionCard>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: 'company', label: 'Company Details', icon: Building2 },
  { id: 'kyc', label: 'KYC / Verification', icon: ShieldCheck },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  { id: 'contact', label: 'Contact Info', icon: Phone },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
];

export default function BuyerAccountSection() {
  const [activeTab, setActiveTab] = useState('company');

  const tabContent: Record<string, React.ReactNode> = {
    company: <CompanyDetailsTab />,
    kyc: <KYCVerificationTab />,
    payments: <PaymentMethodsTab />,
    contact: <ContactInfoTab />,
    preferences: <PreferencesTab />,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Buyer Account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company profile, KYC status, payment methods, and procurement preferences
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className="card p-5 mb-6 flex items-center gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          B
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground">BioFuel India Pvt. Ltd.</h3>
            <span className="badge-active text-xs inline-flex items-center gap-1">
              <CheckCircle2 size={11} />Verified Buyer
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            GST: 27AABCB1234C1ZW · TUCOR Buyer ID: BYR-2026-0042
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground">📍 Navi Mumbai, Maharashtra</span>
            <span className="text-xs text-muted-foreground">🏭 Biodiesel Manufacturer</span>
            <span className="text-xs text-muted-foreground">📅 Member since Feb 2026</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-xs text-muted-foreground">Trust Score</div>
          <div className="text-2xl font-bold text-primary font-mono">82<span className="text-sm text-muted-foreground font-normal">/100</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin mb-6 border-b border-border pb-0">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 -mb-px ${
                isActive
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <TabIcon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tabContent[activeTab]}
    </div>
  );
}
