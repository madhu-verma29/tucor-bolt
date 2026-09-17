'use client';

import React, { useState } from 'react';
import { Building2, MapPin, Phone, Landmark, Edit3, Save, X, CheckCircle2, Clock, AlertCircle, XCircle, RefreshCw, Droplets, Calendar, Users, Truck,  } from 'lucide-react';

type VerificationStatus = 'verified' | 'pending' | 'under_review' | 'rejected' | 'not_submitted';

function VerificationBadge({ status, label }: { status: VerificationStatus; label?: string }) {
  const map: Record<VerificationStatus, { cls: string; icon: React.ReactNode; text: string }> = {
    verified: { cls: 'badge-active', icon: <CheckCircle2 size={12} />, text: label ?? 'Verified' },
    pending: { cls: 'badge-pending', icon: <Clock size={12} />, text: label ?? 'Pending' },
    under_review: { cls: 'badge-info', icon: <RefreshCw size={12} />, text: label ?? 'Under Review' },
    rejected: { cls: 'badge-danger', icon: <XCircle size={12} />, text: label ?? 'Rejected' },
    not_submitted: { cls: 'badge-muted', icon: <AlertCircle size={12} />, text: label ?? 'Not Submitted' },
  };
  const { cls, icon, text } = map[status];
  return <span className={`${cls} inline-flex items-center gap-1`}>{icon}{text}</span>;
}

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card p-6 mb-5">
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

function EditableField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
    </div>
  );
}

// ─── Tab: Company Details ──────────────────────────────────────────────────────
function CompanyDetailsTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: 'Spice Route Kitchens Pvt. Ltd.',
    tradeName: 'Spice Route Kitchens',
    businessType: 'Private Limited Company',
    category: 'Restaurant / Cloud Kitchen',
    pan: 'AABCS1429B',
    cin: 'U55101MH2019PTC321456',
    yearEstablished: '2019',
    website: 'www.spiceroutekitchens.in',
  });
  const saved = { ...form };

  return (
    <SectionCard
      title="Company Details"
      subtitle="Registered business information as per government records"
      action={
        editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><X size={13} />Cancel</button>
            <button onClick={() => setEditing(false)} className="btn-primary py-1.5 px-3 text-xs gap-1"><Save size={13} />Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><Edit3 size={13} />Edit</button>
        )
      }
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField label="Registered Business Name" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} />
          <EditableField label="Trade Name / Brand Name" value={form.tradeName} onChange={(v) => setForm({ ...form, tradeName: v })} />
          <EditableField label="Business Type" value={form.businessType} onChange={(v) => setForm({ ...form, businessType: v })} />
          <EditableField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <EditableField label="PAN Number" value={form.pan} onChange={(v) => setForm({ ...form, pan: v })} />
          <EditableField label="CIN (if applicable)" value={form.cin} onChange={(v) => setForm({ ...form, cin: v })} />
          <EditableField label="Year Established" value={form.yearEstablished} onChange={(v) => setForm({ ...form, yearEstablished: v })} />
          <EditableField label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Registered Business Name" value={form.businessName} />
          <Field label="Trade Name / Brand Name" value={form.tradeName} />
          <Field label="Business Type" value={form.businessType} />
          <Field label="Category" value={form.category} />
          <Field label="PAN Number" value={form.pan} mono />
          <Field label="CIN" value={form.cin} mono />
          <Field label="Year Established" value={form.yearEstablished} />
          <Field label="Website" value={form.website} />
        </div>
      )}
    </SectionCard>
  );
}

// ─── Tab: Contact & Address ────────────────────────────────────────────────────
function ContactAddressTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    primaryContact: 'Priya Nambiar',
    designation: 'Owner / Manager',
    phone: '+91 98765 43210',
    altPhone: '+91 98765 00001',
    email: 'priya@spiceroutekitchens.in',
    addressLine1: '14, Andheri Industrial Estate',
    addressLine2: 'Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    gstState: 'Maharashtra (27)',
  });

  return (
    <SectionCard
      title="Contact & Address"
      subtitle="Primary contact person and registered business address"
      action={
        editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><X size={13} />Cancel</button>
            <button onClick={() => setEditing(false)} className="btn-primary py-1.5 px-3 text-xs gap-1"><Save size={13} />Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><Edit3 size={13} />Edit</button>
        )
      }
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField label="Primary Contact Name" value={form.primaryContact} onChange={(v) => setForm({ ...form, primaryContact: v })} />
          <EditableField label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} />
          <EditableField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
          <EditableField label="Alternate Phone" value={form.altPhone} onChange={(v) => setForm({ ...form, altPhone: v })} type="tel" />
          <EditableField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <EditableField label="Address Line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} />
          <EditableField label="Address Line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} />
          <EditableField label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <EditableField label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          <EditableField label="PIN Code" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Primary Contact" value={form.primaryContact} />
          <Field label="Designation" value={form.designation} />
          <Field label="Phone" value={form.phone} />
          <Field label="Alternate Phone" value={form.altPhone} />
          <Field label="Email" value={form.email} />
          <Field label="Address Line 1" value={form.addressLine1} />
          <Field label="Address Line 2" value={form.addressLine2} />
          <Field label="City / State" value={`${form.city}, ${form.state}`} />
          <Field label="PIN Code" value={form.pincode} mono />
          <Field label="GST State Code" value={form.gstState} />
        </div>
      )}
    </SectionCard>
  );
}

// ─── Tab: Operational Data ─────────────────────────────────────────────────────
function OperationalDataTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    kitchenType: 'Cloud Kitchen + Dine-in',
    seatingCapacity: '45',
    avgDailyCovers: '120',
    operatingDays: 'Monday – Sunday',
    operatingHours: '10:00 AM – 11:00 PM',
    cuisineTypes: 'South Indian, North Indian, Continental',
    avgMonthlyUCO: '180',
    storageCapacity: '500',
    collectionFrequency: 'Weekly',
    preferredPickupDay: 'Wednesday',
  });

  return (
    <SectionCard
      title="Operational Data"
      subtitle="Kitchen operations and UCO generation details"
      action={
        editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><X size={13} />Cancel</button>
            <button onClick={() => setEditing(false)} className="btn-primary py-1.5 px-3 text-xs gap-1"><Save size={13} />Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><Edit3 size={13} />Edit</button>
        )
      }
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField label="Kitchen Type" value={form.kitchenType} onChange={(v) => setForm({ ...form, kitchenType: v })} />
          <EditableField label="Seating Capacity" value={form.seatingCapacity} onChange={(v) => setForm({ ...form, seatingCapacity: v })} />
          <EditableField label="Avg. Daily Covers" value={form.avgDailyCovers} onChange={(v) => setForm({ ...form, avgDailyCovers: v })} />
          <EditableField label="Operating Days" value={form.operatingDays} onChange={(v) => setForm({ ...form, operatingDays: v })} />
          <EditableField label="Operating Hours" value={form.operatingHours} onChange={(v) => setForm({ ...form, operatingHours: v })} />
          <EditableField label="Cuisine Types" value={form.cuisineTypes} onChange={(v) => setForm({ ...form, cuisineTypes: v })} />
          <EditableField label="Avg. Monthly UCO (Liters)" value={form.avgMonthlyUCO} onChange={(v) => setForm({ ...form, avgMonthlyUCO: v })} />
          <EditableField label="Storage Capacity (Liters)" value={form.storageCapacity} onChange={(v) => setForm({ ...form, storageCapacity: v })} />
          <EditableField label="Collection Frequency" value={form.collectionFrequency} onChange={(v) => setForm({ ...form, collectionFrequency: v })} />
          <EditableField label="Preferred Pickup Day" value={form.preferredPickupDay} onChange={(v) => setForm({ ...form, preferredPickupDay: v })} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Kitchen Type" value={form.kitchenType} />
          <Field label="Seating Capacity" value={`${form.seatingCapacity} covers`} />
          <Field label="Avg. Daily Covers" value={form.avgDailyCovers} />
          <Field label="Operating Days" value={form.operatingDays} />
          <Field label="Operating Hours" value={form.operatingHours} />
          <Field label="Cuisine Types" value={form.cuisineTypes} />
          <Field label="Avg. Monthly UCO" value={`${form.avgMonthlyUCO} Liters`} />
          <Field label="Storage Capacity" value={`${form.storageCapacity} Liters`} />
          <Field label="Collection Frequency" value={form.collectionFrequency} />
          <Field label="Preferred Pickup Day" value={form.preferredPickupDay} />
        </div>
      )}
    </SectionCard>
  );
}

// ─── Tab: Banking ──────────────────────────────────────────────────────────────
function BankingTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    accountName: 'Spice Route Kitchens Pvt. Ltd.',
    accountNumber: '••••••••4521',
    bankName: 'HDFC Bank',
    branch: 'Andheri East, Mumbai',
    ifsc: 'HDFC0001234',
    accountType: 'Current Account',
    upiId: 'spiceroute@hdfcbank',
  });

  return (
    <SectionCard
      title="Banking & Payment Details"
      subtitle="Bank account linked for UCO payment settlements"
      action={
        editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><X size={13} />Cancel</button>
            <button onClick={() => setEditing(false)} className="btn-primary py-1.5 px-3 text-xs gap-1"><Save size={13} />Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs gap-1"><Edit3 size={13} />Edit</button>
        )
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <Field label="Account Name" value={form.accountName} />
        <Field label="Account Number" value={form.accountNumber} mono />
        <Field label="Bank Name" value={form.bankName} />
        <Field label="Branch" value={form.branch} />
        <Field label="IFSC Code" value={form.ifsc} mono />
        <Field label="Account Type" value={form.accountType} />
        <Field label="UPI ID" value={form.upiId} mono />
      </div>
      <div className="mt-4 p-3 rounded-xl bg-success/8 border border-success/20 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-success flex-shrink-0" />
        <span className="text-xs text-success font-medium">Bank account verified and linked for settlements</span>
      </div>
    </SectionCard>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'company', label: 'Company Details', icon: Building2 },
  { id: 'contact', label: 'Contact & Address', icon: MapPin },
  { id: 'operations', label: 'Operational Data', icon: Droplets },
  { id: 'banking', label: 'Banking', icon: Landmark },
];

export default function BusinessProfileSection() {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your registered business details, contact information, and operational data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VerificationBadge status="verified" label="Profile Verified" />
        </div>
      </div>

      {/* Profile summary card */}
      <div className="card p-5 flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-2xl gradient-card-green flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
          S
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-foreground">Spice Route Kitchens Pvt. Ltd.</div>
          <div className="text-sm text-muted-foreground mt-0.5">Restaurant / Cloud Kitchen · Mumbai, Maharashtra</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge-active text-xs">FSSAI Verified</span>
            <span className="badge-active text-xs">GST Registered</span>
            <span className="badge-info text-xs">TUCOR Seller</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Droplets, label: 'Avg UCO/mo', value: '180 L' },
            { icon: Calendar, label: 'Member Since', value: 'Mar 2026' },
            { icon: Truck, label: 'Pickups Done', value: '24' },
            { icon: Users, label: 'Active Orders', value: '3' },
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={`biz-stat-${stat.label}`} className="flex flex-col items-center gap-1">
                <StatIcon size={16} className="text-primary" />
                <div className="text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={`biz-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'company' && <CompanyDetailsTab />}
      {activeTab === 'contact' && <ContactAddressTab />}
      {activeTab === 'operations' && <OperationalDataTab />}
      {activeTab === 'banking' && <BankingTab />}
    </div>
  );
}
