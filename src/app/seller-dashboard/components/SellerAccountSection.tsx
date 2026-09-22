'use client';

import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, Phone, Settings, CheckCircle2, Clock, AlertCircle, XCircle, Edit3, Save, X, Eye, EyeOff, Upload, ChevronRight, MapPin, Mail, Hash, Landmark, Lock, Trash2, RefreshCw, Info,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { downloadSellerDocument, sellerApi, uploadSellerDocument, type SellerDocument } from '@/lib/seller-api';


// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = 'verified' | 'pending' | 'under_review' | 'rejected' | 'not_submitted';

interface VerificationBadgeProps {
  status: VerificationStatus;
  label?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function VerificationBadge({ status, label }: VerificationBadgeProps) {
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

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
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
      <div className={`text-sm font-medium text-foreground ${mono ? 'font-mono-data' : ''}`}>{value}</div>
    </div>
  );
}

// ─── Tab: Company Details ──────────────────────────────────────────────────────

function CompanyDetailsTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: '', tradeName: '', businessType: '', category: '', pan: '', cin: '', yearEstablished: '', website: '', address: '', city: '', state: '', pincode: '', country: 'India',
  });

  const handleChange = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  useEffect(()=>{sellerApi.profile().then(p=>setForm({businessName:p.businessName,tradeName:p.tradeName,businessType:p.businessType,category:p.category,pan:p.pan,cin:p.cin,yearEstablished:p.yearEstablished,website:p.website,address:p.addressLine1,city:p.city,state:p.state,pincode:p.pincode,country:p.country})).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load company details'))},[]);
  const save=async()=>{try{await sellerApi.updateProfile({businessName:form.businessName,tradeName:form.tradeName,businessType:form.businessType,category:form.category,pan:form.pan,cin:form.cin,yearEstablished:form.yearEstablished,website:form.website,addressLine1:form.address,city:form.city,state:form.state,pincode:form.pincode,country:form.country});setEditing(false);toast.success('Company details saved')}catch(e){toast.error(e instanceof Error?e.message:'Unable to save company details')}};

  return (
    <div>
      <SectionCard
        title="Registered Business Information"
        subtitle="Legal entity details as per government registration"
        action={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><X size={13} />Cancel</button>
              <button onClick={save} className="btn-primary text-xs px-3 py-1.5 gap-1.5"><Save size={13} />Save</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Edit3 size={13} />Edit</button>
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
        subtitle="Primary business address for correspondence and pickup"
        action={
          editing ? null : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Edit3 size={13} />Edit</button>
          )
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
              <div className="text-sm text-muted-foreground mt-0.5">{form.city}, {form.state} – {form.pincode}</div>
              <div className="text-sm text-muted-foreground">{form.country}</div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: GST / FSSAI Verification ────────────────────────────────────────────

interface DocRowProps {
  icon: React.ReactNode;
  title: string;
  number: string;
  status: VerificationStatus;
  expiry?: string;
  submittedOn?: string;
  note?: string;
  onUpload?: () => void;
  onView?: () => void;
}

function DocRow({ icon, title, number, status, expiry, submittedOn, note, onUpload, onView }: DocRowProps) {
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
          <div className="text-xs text-muted-foreground font-mono-data mt-0.5">{number}</div>
        </div>
        <VerificationBadge status={status} />
        <ChevronRight size={16} className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {submittedOn && <Field label="Submitted On" value={submittedOn} />}
            {expiry && <Field label="Valid Until" value={expiry} />}
            <Field label="Verification Status" value={status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
          </div>
          {note && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-bg border border-amber-200 text-xs text-warning">
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              {note}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={onUpload} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Upload size={13} />Re-upload Document</button>
            <button onClick={onView} className="btn-ghost text-xs px-3 py-1.5 gap-1.5"><Eye size={13} />View Document</button>
          </div>
        </div>
      )}
    </div>
  );
}

function GSTFSSAITab() {
  const [documents,setDocuments]=useState<SellerDocument[]>([]);const [profile,setProfile]=useState<any>(null);const [bankLinked,setBankLinked]=useState(false);
  const load=()=>Promise.all([sellerApi.documents(),sellerApi.profile(),sellerApi.bankAccount()]).then(([d,p,b])=>{setDocuments(d);setProfile(p);setBankLinked(!!b.accountNumber)});useEffect(()=>{load().catch(()=>{})},[]);
  const documentFor=(type:string)=>documents.find(d=>d.type===type);const status=(type:string):VerificationStatus=>{const d=documentFor(type);return !d?'not_submitted':d.status==='VERIFIED'?'verified':d.status==='REJECTED'?'rejected':'under_review'};
  const upload=(type:string)=>{const input=document.createElement('input');input.type='file';input.accept='.pdf,.png,.jpg,.jpeg';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{await uploadSellerDocument(type,file);await load();toast.success('Document uploaded')}catch(e){toast.error(e instanceof Error?e.message:'Upload failed')}};input.click()};
  const view=async(type:string)=>{const d=documentFor(type);if(!d)return;try{await downloadSellerDocument(d.id,d.name)}catch(e){toast.error(e instanceof Error?e.message:'Download failed')}};
  const checks=[status('GST')==='verified',status('FSSAI')==='verified',bankLinked,status('ADDRESS_PROOF')==='verified',status('DIRECTOR_KYC')==='verified'];const complete=checks.filter(Boolean).length;
  return (
    <div>
      {/* Trust Score */}
      <div className="card p-5 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-1">TUCOR Trust Score</div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary font-mono-data">{Math.round(complete/checks.length*100)}</span>
              <span className="text-muted-foreground text-sm mb-1">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on verification completeness, transaction history, and compliance</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
            {[
              { label: 'GST Verified', done: checks[0] },
              { label: 'FSSAI Licensed', done: checks[1] },
              { label: 'Bank Account Linked', done: checks[2] },
              { label: 'Address Proof', done: checks[3] },
              { label: 'Director KYC', done: checks[4] },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                {done
                  ? <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                  : <AlertCircle size={13} className="text-warning flex-shrink-0" />}
                <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Verification Progress</span><span>{complete} of 5 complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${complete/checks.length*100}%` }} />
          </div>
        </div>
      </div>

      <SectionCard title="Compliance Documents" subtitle="Government-issued registrations required for marketplace participation">
        <DocRow
          icon={<Hash size={16} className="text-primary" />}
          title="GST Registration"
          number={profile?.gstNumber||'—'}
          status={status('GST')}
          submittedOn={documentFor('GST')?.uploadedAt?.slice(0,10)}
          expiry="Lifetime (Annual Filing)"
          onUpload={()=>upload('GST')} onView={()=>view('GST')}
        />
        <DocRow
          icon={<ShieldCheck size={16} className="text-primary" />}
          title="FSSAI License"
          number={profile?.fssaiNumber||'—'}
          status={status('FSSAI')}
          submittedOn={documentFor('FSSAI')?.uploadedAt?.slice(0,10)}
          expiry={documentFor('FSSAI')?.expiresAt}
          onUpload={()=>upload('FSSAI')} onView={()=>view('FSSAI')}
        />
        <DocRow
          icon={<Building2 size={16} className="text-primary" />}
          title="Address Proof (Utility Bill)"
          number="—"
          status={status('ADDRESS_PROOF')}
          submittedOn={documentFor('ADDRESS_PROOF')?.uploadedAt?.slice(0,10)}
          onUpload={()=>upload('ADDRESS_PROOF')} onView={()=>view('ADDRESS_PROOF')}
          note="Please upload a recent electricity or water bill (not older than 3 months) to complete your verification."
        />
        <DocRow
          icon={<Building2 size={16} className="text-primary" />}
          title="Director / Proprietor KYC"
          number="—"
          status={status('DIRECTOR_KYC')}
          submittedOn={documentFor('DIRECTOR_KYC')?.uploadedAt?.slice(0,10)}
          onUpload={()=>upload('DIRECTOR_KYC')} onView={()=>view('DIRECTOR_KYC')}
          note="Your KYC documents are under review by the TUCOR compliance team. Expected completion: 2–3 business days."
        />
      </SectionCard>

      <SectionCard title="Verification Timeline" subtitle="History of your compliance submissions">
        <div className="space-y-3">
          {documents.map(d => ({ date:d.uploadedAt.slice(0,10), event:`${d.type.replaceAll('_',' ')} — ${d.status.replaceAll('_',' ')}`, docStatus:status(d.type) })).map(({ date, event, docStatus }) => (
            <div key={`${date}-${event}`} className="flex items-start gap-3">
              <VerificationBadge status={docStatus} />
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

// ─── Tab: Bank Account ─────────────────────────────────────────────────────────

function BankAccountTab() {
  const [editing, setEditing] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [form, setForm] = useState({
    accountHolder: '', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: '',
  });
  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const masked = '•••• •••• •••• ' + form.accountNumber.slice(-4);
  useEffect(()=>{sellerApi.bankAccount().then(b=>setForm({accountHolder:b.accountHolder,accountNumber:b.accountNumber,ifsc:b.ifsc,bankName:b.bankName,branch:b.branch,accountType:b.accountType})).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load bank account'))},[]);
  const save=async()=>{try{await sellerApi.updateBankAccount({accountHolder:form.accountHolder,accountNumber:form.accountNumber,ifsc:form.ifsc,bankName:form.bankName,branch:form.branch,accountType:form.accountType,upiId:''});setEditing(false);toast.success('Bank account saved')}catch(e){toast.error(e instanceof Error?e.message:'Unable to save bank account')}};

  return (
    <div>
      <SectionCard
        title="Primary Settlement Account"
        subtitle="Payments from TUCOR orders are settled to this account"
        action={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><X size={13} />Cancel</button>
              <button onClick={save} className="btn-primary text-xs px-3 py-1.5 gap-1.5"><Save size={13} />Save</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Edit3 size={13} />Edit</button>
          )
        }
      >
        {/* Verified chip */}
        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-success-bg border border-green-200">
          <CheckCircle2 size={15} className="text-success flex-shrink-0" />
          <span className="text-xs font-medium text-success">Bank account verified via penny-drop verification on 10 Aug 2026</span>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'accountHolder', label: 'Account Holder Name' },
              { key: 'accountNumber', label: 'Account Number' },
              { key: 'ifsc', label: 'IFSC Code' },
              { key: 'bankName', label: 'Bank Name' },
              { key: 'branch', label: 'Branch' },
              { key: 'accountType', label: 'Account Type' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input className="input-field" value={form[key as keyof typeof form]} onChange={(e) => handleChange(key, e.target.value)} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-bg border border-amber-200 text-xs text-warning">
                <Info size={13} className="flex-shrink-0 mt-0.5" />
                Changing bank details requires re-verification. Settlements will be paused until the new account is verified.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="Account Holder" value={form.accountHolder} />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Account Number</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground font-mono-data">{showFull ? form.accountNumber : masked}</span>
                <button onClick={() => setShowFull((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <Field label="IFSC Code" value={form.ifsc} mono />
            <Field label="Bank Name" value={form.bankName} />
            <Field label="Branch" value={form.branch} />
            <Field label="Account Type" value={form.accountType} />
          </div>
        )}
      </SectionCard>

      {/* Settlement Summary */}
      <SectionCard title="Settlement Summary" subtitle="Recent payment settlements to this account">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Reference', 'Order', 'Amount', 'Date', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { ref: 'SETL-2026-0091', order: 'ORD-2026-0041', amount: '₹13,440', date: '05 Sep 2026', status: 'Settled' },
                { ref: 'SETL-2026-0078', order: 'ORD-2026-0035', amount: '₹8,680', date: '28 Aug 2026', status: 'Settled' },
                { ref: 'SETL-2026-0063', order: 'ORD-2026-0029', amount: '₹11,200', date: '15 Aug 2026', status: 'Settled' },
                { ref: 'SETL-2026-0051', order: 'ORD-2026-0022', amount: '₹6,300', date: '02 Aug 2026', status: 'Processing' },
              ].map((row) => (
                <tr key={row.ref} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4 font-mono-data text-xs text-foreground">{row.ref}</td>
                  <td className="py-3 pr-4 font-mono-data text-xs text-muted-foreground">{row.order}</td>
                  <td className="py-3 pr-4 font-semibold text-foreground">{row.amount}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{row.date}</td>
                  <td className="py-3 pr-4">
                    <span className={row.status === 'Settled' ? 'badge-active text-xs' : 'badge-pending text-xs'}>
                      {row.status}
                    </span>
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

// ─── Tab: Contact Info ─────────────────────────────────────────────────────────

function ContactInfoTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    primaryName: '', primaryRole: '', primaryPhone: '', primaryEmail: '', altPhone: '', altEmail: '', pickupContact: '', pickupPhone: '', pickupAvailability: '',
  });
  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(()=>{sellerApi.profile().then(p=>setForm({primaryName:p.primaryContact,primaryRole:p.designation,primaryPhone:p.phone,primaryEmail:p.contactEmail,altPhone:p.altPhone,altEmail:p.altEmail,pickupContact:p.pickupContact,pickupPhone:p.pickupPhone,pickupAvailability:p.pickupAvailability})).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load contact details'))},[]);
  const save=async()=>{try{await sellerApi.updateProfile({primaryContact:form.primaryName,designation:form.primaryRole,phone:form.primaryPhone,contactEmail:form.primaryEmail,altPhone:form.altPhone,altEmail:form.altEmail,pickupContact:form.pickupContact,pickupPhone:form.pickupPhone,pickupAvailability:form.pickupAvailability});setEditing(false);toast.success('Contact information saved')}catch(e){toast.error(e instanceof Error?e.message:'Unable to save contact information')}};

  return (
    <div>
      <SectionCard
        title="Primary Contact"
        subtitle="Main point of contact for TUCOR communications"
        action={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><X size={13} />Cancel</button>
              <button onClick={save} className="btn-primary text-xs px-3 py-1.5 gap-1.5"><Save size={13} />Save</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Edit3 size={13} />Edit</button>
          )
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'primaryName', label: 'Full Name' },
              { key: 'primaryRole', label: 'Designation / Role' },
              { key: 'primaryPhone', label: 'Mobile Number' },
              { key: 'primaryEmail', label: 'Email Address' },
              { key: 'altPhone', label: 'Alternate Phone' },
              { key: 'altEmail', label: 'Alternate Email' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input className="input-field" value={form[key as keyof typeof form]} onChange={(e) => handleChange(key, e.target.value)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="Full Name" value={form.primaryName} />
            <Field label="Designation" value={form.primaryRole} />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Mobile</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Phone size={13} className="text-primary" />{form.primaryPhone}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Email</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Mail size={13} className="text-primary" />{form.primaryEmail}
              </div>
            </div>
            <Field label="Alternate Phone" value={form.altPhone} />
            <Field label="Alternate Email" value={form.altEmail} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Pickup Coordinator"
        subtitle="Person available on-site during UCO collection pickups"
        action={
          editing ? null : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Edit3 size={13} />Edit</button>
          )
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'pickupContact', label: 'Contact Name' },
              { key: 'pickupPhone', label: 'Phone Number' },
              { key: 'pickupAvailability', label: 'Availability Hours' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input className="input-field" value={form[key as keyof typeof form]} onChange={(e) => handleChange(key, e.target.value)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="Contact Name" value={form.pickupContact} />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Phone</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Phone size={13} className="text-primary" />{form.pickupPhone}
              </div>
            </div>
            <Field label="Availability" value={form.pickupAvailability} />
          </div>
        )}
      </SectionCard>

      {/* Communication Preferences */}
      <SectionCard title="Communication Preferences" subtitle="How TUCOR contacts you for different events">
        <div className="space-y-3">
          {[
            { label: 'Order confirmations & updates', email: true, sms: true, push: false },
            { label: 'Pickup scheduling & reminders', email: true, sms: true, push: true },
            { label: 'Payment & settlement alerts', email: true, sms: false, push: false },
            { label: 'Listing status changes', email: true, sms: false, push: true },
            { label: 'Platform announcements', email: false, sms: false, push: false },
          ].map(({ label, email, sms, push }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
              <span className="text-sm text-foreground">{label}</span>
              <div className="flex items-center gap-4">
                {[{ ch: 'Email', val: email }, { ch: 'SMS', val: sms }, { ch: 'Push', val: push }].map(({ ch, val }) => (
                  <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={val} className="w-3.5 h-3.5 accent-primary" />
                    <span className="text-xs text-muted-foreground">{ch}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Settings ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  useEffect(()=>{sellerApi.preferences().then(p=>{setTwoFA(p.twoFactor);setLoginAlerts(p.loginAlerts);setAutoInvoice(p.autoInvoice);setWeeklyReport(p.weeklyReport)}).catch(()=>{})},[]);
  const savePreferences=(next:{twoFactor:boolean;loginAlerts:boolean;autoInvoice:boolean;weeklyReport:boolean})=>sellerApi.updatePreferences(next).catch(e=>toast.error(e instanceof Error?e.message:'Unable to save preference'));
  const changePassword=async()=>{if(newPw.length<8||newPw!==confirmPw){toast.error(newPw!==confirmPw?'Passwords do not match':'New password must be at least 8 characters');return}try{await sellerApi.changePassword({currentPassword:currentPw,newPassword:newPw});setCurrentPw('');setNewPw('');setConfirmPw('');toast.success('Password updated successfully')}catch(e){toast.error(e instanceof Error?e.message:'Unable to update password')}};

  return (
    <div>
      {/* Security */}
      <SectionCard title="Security" subtitle="Manage your password and account access">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label-text">Current Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-field pr-10" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
              <button onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div />
          <div>
            <label className="label-text">New Password</label>
            <input type={showPw ? 'text' : 'password'} className="input-field" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="label-text">Confirm New Password</label>
            <input type={showPw ? 'text' : 'password'} className="input-field" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter new password" />
          </div>
        </div>
        <button onClick={changePassword} className="btn-primary text-sm gap-1.5"><Lock size={14} />Update Password</button>
      </SectionCard>

      {/* Account Security Toggles */}
      <SectionCard title="Account Security" subtitle="Additional security settings for your seller account">
        <div className="space-y-4">
          {[
            { label: 'Two-Factor Authentication (2FA)', desc: 'Require OTP on every login via registered mobile', val: twoFA, set: setTwoFA },
            { label: 'Login Alerts', desc: 'Receive email notification on new device logins', val: loginAlerts, set: setLoginAlerts },
          ].map(({ label, desc, val, set }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
              <button
                onClick={() => {const next=!val;set(next);savePreferences({twoFactor:label.startsWith('Two-Factor')?next:twoFA,loginAlerts:label==='Login Alerts'?next:loginAlerts,autoInvoice,weeklyReport})}}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${val ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${val ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Platform Preferences */}
      <SectionCard title="Platform Preferences" subtitle="Customize your TUCOR seller experience">
        <div className="space-y-4">
          {[
            { label: 'Auto-generate Invoices', desc: 'Automatically create invoices after each settlement', val: autoInvoice, set: setAutoInvoice },
            { label: 'Weekly Summary Report', desc: 'Receive a weekly email with your collection and earnings summary', val: weeklyReport, set: setWeeklyReport },
          ].map(({ label, desc, val, set }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
              <button
                onClick={() => {const next=!val;set(next);savePreferences({twoFactor:twoFA,loginAlerts,autoInvoice:label==='Auto-generate Invoices'?next:autoInvoice,weeklyReport:label==='Weekly Summary Report'?next:weeklyReport})}}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${val ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${val ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <SectionCard title="Danger Zone" subtitle="Irreversible account actions — proceed with caution">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div>
              <div className="text-sm font-semibold text-foreground">Deactivate Seller Account</div>
              <div className="text-xs text-muted-foreground mt-0.5">Temporarily pause all listings and order activity</div>
            </div>
            <button className="btn-secondary text-xs px-3 py-1.5 text-warning border-warning/30 hover:bg-warning-bg">Deactivate</button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-danger/30 bg-danger-bg/50">
            <div>
              <div className="text-sm font-semibold text-danger">Delete Account</div>
              <div className="text-xs text-muted-foreground mt-0.5">Permanently remove your seller account and all associated data</div>
            </div>
            <button className="btn-danger text-xs px-3 py-1.5 gap-1.5"><Trash2 size={13} />Delete</button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type TabId = 'company' | 'gst_fssai' | 'bank' | 'contact' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: 'company', label: 'Company Details', icon: Building2 },
  { id: 'gst_fssai', label: 'GST / FSSAI', icon: ShieldCheck },
  { id: 'bank', label: 'Bank Account', icon: Landmark },
  { id: 'contact', label: 'Contact Info', icon: Phone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function SellerAccountSection() {
  const [activeTab, setActiveTab] = useState<TabId>('company');

  const tabContent: Record<TabId, React.ReactNode> = {
    company: <CompanyDetailsTab />,
    gst_fssai: <GSTFSSAITab />,
    bank: <BankAccountTab />,
    contact: <ContactInfoTab />,
    settings: <SettingsTab />,
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Seller Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your business profile, compliance documents, bank details, and account settings</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1 mb-6 bg-muted/40 p-1 rounded-2xl w-fit max-w-full">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              activeTab === id
                ? 'bg-card text-primary shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}
