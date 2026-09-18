'use client';

import React, { useEffect, useState } from 'react';
import { buyerApi, BuyerProfile, uploadBuyerDocument } from '@/lib/buyer-api';
import { getSession } from '@/lib/auth-api';
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
    businessName: '',
    tradeName: '',
    businessType: '',
    category: '',
    pan: '',
    cin: '',
    yearEstablished: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  useEffect(()=>{buyerApi.profile().then(p=>setForm({businessName:p.businessName||'',tradeName:p.tradeName||'',businessType:p.businessType||'',category:p.category||'',pan:p.pan||'',cin:p.cin||'',yearEstablished:p.yearEstablished||'',website:p.website||'',address:p.address||'',city:p.city||'',state:p.state||'',pincode:p.pincode||'',country:p.country||'India'})).catch(()=>{});},[]);
  const handleChange = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const save=async()=>{try{const p=await buyerApi.profile();await buyerApi.updateProfile({...p,...form});setEditing(false)}catch{}};

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
              <button onClick={save} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
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
            <button onClick={onUpload} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Upload size={13} />Upload / Replace</button>{onView&&<button onClick={onView} className="btn-ghost text-xs px-3 py-1.5 gap-1.5"><Eye size={13} />View Document</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function KYCVerificationTab() {
 const [profile,setProfile]=useState<any>(null),[docs,setDocs]=useState<any[]>([]),[banks,setBanks]=useState<any[]>([]);const inputRef=React.useRef<HTMLInputElement>(null);const [uploadType,setUploadType]=useState('GST');
 const load=()=>Promise.all([buyerApi.profile(),buyerApi.documents(),buyerApi.bankAccounts()]).then(([p,d,b])=>{setProfile(p);setDocs(d);setBanks(b)});useEffect(()=>{load().catch(()=>{})},[]);
 const status=(type:string):VerificationStatus=>{const d=docs.find(x=>x.type===type);return !d?'not_submitted':d.status==='VERIFIED'?'verified':d.status==='REJECTED'?'rejected':'under_review'};
 const upload=(type:string)=>{setUploadType(type);inputRef.current?.click()};const onFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;try{await uploadBuyerDocument(uploadType,f);await load()}finally{e.target.value=''}};
 const view=async(type:string)=>{const d=docs.find(x=>x.type===type);if(!d)return;const s=getSession(),base=(process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'');const res=await fetch(base+'/api/buyer/documents/'+d.id+'/download',{headers:{Authorization:`Bearer ${s?.accessToken||''}`}});if(!res.ok)return;const blob=await res.blob();const url=URL.createObjectURL(blob);window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),60000)};
 const checks=[status('GST')==='verified',status('PAN')==='verified',banks.length>0,status('DIRECTOR_KYC')==='verified',status('END_USE_DECLARATION')==='verified'];const complete=checks.filter(Boolean).length,score=Math.round(complete/checks.length*100);
 const rows=[['GST','GST Registration Certificate',profile?.gstNumber||'—'],['PAN','Business PAN Card',profile?.pan||'—'],['END_USE_DECLARATION','End-Use Declaration (UCO)','—'],['DIRECTOR_KYC','Director / Authorized Signatory KYC','—']] as const;
 return <div><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onFile}/><div className="card p-5 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"><div className="flex items-center justify-between flex-wrap gap-4"><div><div className="section-label mb-1">Verification Completeness</div><div className="flex items-end gap-2"><span className="text-4xl font-bold text-primary font-mono">{score}</span><span className="text-muted-foreground text-sm mb-1">/ 100</span></div><p className="text-xs text-muted-foreground mt-1">Based on current verification completeness</p></div><div className="flex flex-col gap-2 min-w-[200px]">{[['GST Registration Verified',checks[0]],['Business PAN Verified',checks[1]],['Bank Account Linked',checks[2]],['Director KYC',checks[3]],['End-Use Declaration',checks[4]]].map(([label,done]:any)=><div key={label} className="flex items-center gap-2 text-xs">{done?<CheckCircle2 size={13} className="text-success"/>:<AlertCircle size={13} className="text-warning"/>}<span>{label}</span></div>)}</div></div><div className="mt-4"><div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Verification Progress</span><span>{complete} of 5 complete</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{width:`${score}%`}}/></div></div></div><SectionCard title="KYC & Compliance Documents" subtitle="Required documents for buyer verification and procurement eligibility">{rows.map(([type,title,num])=>{const d=docs.find(x=>x.type===type);return <DocRow key={type} icon={<ShieldCheck size={16} className="text-primary"/>} title={title} number={num} status={status(type)} submittedOn={d?.uploadedAt?.slice(0,10)} onUpload={()=>upload(type)} onView={d?()=>view(type):undefined}/>})}</SectionCard><SectionCard title="Verification Timeline" subtitle="History of your compliance submissions and approvals"><div className="space-y-3">{docs.map((d:any)=><div key={d.id} className="flex items-start gap-3"><VerificationBadge status={d.status==='VERIFIED'?'verified':d.status==='REJECTED'?'rejected':'under_review'}/><div><div className="text-sm text-foreground">{d.type.replaceAll('_',' ')} — {d.status.replaceAll('_',' ')}</div><div className="text-xs text-muted-foreground mt-0.5">{d.uploadedAt?.slice(0,10)}</div></div></div>)}</div></SectionCard></div>
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
  const [paymentRows,setPaymentRows]=useState<any[]>([]); useEffect(()=>{buyerApi.payments().then(setPaymentRows).catch(()=>setPaymentRows([]));},[]);
  const [showFull, setShowFull] = useState<string | null>(null);
  const [methods,setMethods] = useState<PaymentCard[]>([]);
  useEffect(()=>{buyerApi.bankAccounts().then(a=>setMethods(a.map((x:any)=>({id:x.id,type:'bank',label:`${x.bankName} — ${x.accountType}`,detail:`IFSC: ${x.ifsc} · Branch: ${x.branch||'—'}`,masked:x.accountNumber,verified:x.verified,primary:x.primary})))).catch(()=>setMethods([]));},[]);
  const refresh=()=>buyerApi.bankAccounts().then(a=>setMethods(a.map((x:any)=>({id:x.id,type:'bank' as const,label:`${x.bankName} — ${x.accountType}`,detail:`IFSC: ${x.ifsc} · Branch: ${x.branch||'—'}`,masked:x.accountNumber,verified:x.verified,primary:x.primary}))));


  return (
    <div>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-6 text-xs text-primary">
        <Info size={13} className="flex-shrink-0" />
        Payment methods are used for UCO procurement transactions. Payment status is confirmed only after the configured payment provider verifies settlement.
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
                    {m.masked}
                  </span>
                  <button
                    onClick={() => setShowFull(showFull === m.id ? null : m.id)} disabled
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showFull === m.id ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!m.primary && (
                  <button onClick={()=>buyerApi.setPrimaryBank(m.id).then(refresh)} className="btn-ghost text-xs px-2.5 py-1.5">Set Primary</button>
                )}
                <button onClick={()=>buyerApi.deleteBank(m.id).then(refresh)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
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
              {paymentRows.map((row:any) => (
                <tr key={row.orderId}>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">{row.settledDate||row.dueDate||'—'}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-foreground">{row.ref}</td>
                  <td className="py-3 pr-4 text-xs text-foreground">{row.reference||'—'}</td>
                  <td className="py-3 text-right font-semibold text-xs text-foreground">{`₹${Number(row.amount).toLocaleString('en-IN')}`}</td>
                  <td className="py-3 pl-4 text-right">
                    <span className={row.status==='Settled'?'badge-active text-xs':'badge-pending text-xs'}>{row.status}</span>
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
    primaryName: '',
    primaryRole: '',
    primaryPhone: '',
    primaryEmail: '',
    altName: '',
    altRole: '',
    altPhone: '',
    altEmail: '',
    warehouseAddress: '',
    warehouseContact: '',
    warehouseHours: '',
  });

  useEffect(()=>{buyerApi.contacts().then(setForm).catch(()=>{});},[]); const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
              <button onClick={async()=>{try{setForm(await buyerApi.updateContacts(form));setEditing(false)}catch{}}} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
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
  const [activeTab, setActiveTab] = useState('company'); const [profile,setProfile]=useState<BuyerProfile|null>(null);useEffect(()=>{buyerApi.profile().then(setProfile).catch(()=>{});},[]);

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
            <h3 className="text-base font-bold text-foreground">{profile?.businessName||'Buyer'}</h3>
            <span className="badge-active text-xs inline-flex items-center gap-1">
              <CheckCircle2 size={11} />{profile?.status==='ACTIVE'?'Active Buyer':profile?.status||'Buyer'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            GST: {profile?.gstNumber||'—'} · TUCOR Buyer ID: {profile?.id||'—'}
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground">📍 {profile ? [profile.city,profile.state].filter(Boolean).join(', ') : '—'}</span>
            <span className="text-xs text-muted-foreground">🏭 {profile?.category||profile?.businessType||'—'}</span>
            <span className="text-xs text-muted-foreground">Account status: {profile?.status||'—'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-xs text-muted-foreground">Verification</div>
          <div className="text-sm font-bold text-primary">{profile?.status||"—"}</div>
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
