'use client';

import React, { useEffect, useState } from 'react';
import { buyerApi, uploadBuyerDocument } from '@/lib/buyer-api';
import { getSession } from '@/lib/auth-api';
import { toast } from 'sonner';
import { Building2, ShieldCheck, Landmark, Phone, Settings, CheckCircle2, Clock, AlertCircle, XCircle, Edit3, Save, X, Eye, EyeOff, Upload, ChevronRight, MapPin, Info, RefreshCw, Hash, Plus, Trash2, ToggleLeft, ToggleRight, Star, Lock, Globe,  } from 'lucide-react';

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

  useEffect(()=>{buyerApi.profile().then(p=>setForm(f=>({...f,businessName:p.businessName||'',tradeName:p.tradeName||'',businessType:p.businessType||'',category:p.category||'',pan:p.pan||'',cin:p.cin||'',yearEstablished:p.yearEstablished||'',website:p.website||'',address:p.address||'',city:p.city||'',state:p.state||'',pincode:p.pincode||'',country:p.country||'India'}))).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load profile'));},[]);
  const handleChange = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const saveCompany=async()=>{try{const current=await buyerApi.profile();await buyerApi.updateProfile({...current,...form});setEditing(false);toast.success('Business profile saved');}catch(e){toast.error(e instanceof Error?e.message:'Unable to save profile')}};

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
              <button onClick={saveCompany} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
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
        subtitle="Primary business address for procurement correspondence and UCO delivery"
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

// ─── Tab: Verification / KYC ──────────────────────────────────────────────────

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
            <button onClick={onUpload} className="btn-secondary text-xs px-3 py-1.5 gap-1.5"><Upload size={13} />Upload / Replace</button>
            {onView && <button onClick={onView} className="btn-ghost text-xs px-3 py-1.5 gap-1.5"><Eye size={13} />View Document</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationTab() { const [profile,setProfile]=useState<any>(null);const [docs,setDocs]=useState<any[]>([]);const [banks,setBanks]=useState<any[]>([]);const inputRef=React.useRef<HTMLInputElement>(null);const [uploadType,setUploadType]=useState('GST');const load=()=>Promise.all([buyerApi.profile(),buyerApi.documents(),buyerApi.bankAccounts()]).then(([p,d,b])=>{setProfile(p);setDocs(d);setBanks(b)});useEffect(()=>{load().catch(()=>{})},[]);const status=(type:string):VerificationStatus=>{const d=docs.find(x=>x.type===type);return !d?'not_submitted':d.status==='VERIFIED'?'verified':d.status==='REJECTED'?'rejected':'under_review'};const upload=(type:string)=>{setUploadType(type);inputRef.current?.click()};const onFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;try{await uploadBuyerDocument(uploadType,f);await load();toast.success('Document uploaded')}catch(err){toast.error(err instanceof Error?err.message:'Upload failed')}finally{e.target.value=''}};const view=async(type:string)=>{const d=docs.find(x=>x.type===type);if(!d)return;const s=getSession(),base=(process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'');const res=await fetch(base+'/api/buyer/documents/'+d.id+'/download',{headers:{Authorization:`Bearer ${s?.accessToken||''}`}});if(!res.ok)return;const blob=await res.blob();window.open(URL.createObjectURL(blob),'_blank')};const checks=[status('GST')==='verified',status('PAN')==='verified',banks.length>0,status('DIRECTOR_KYC')==='verified',status('END_USE_DECLARATION')==='verified'];const complete=checks.filter(Boolean).length;const score=Math.round(complete/checks.length*100);const rows=[['GST','GST Registration Certificate',profile?.gstNumber||'—'],['PAN','Business PAN Card',profile?.pan||'—'],['END_USE_DECLARATION','End-Use Declaration (UCO)','—'],['DIRECTOR_KYC','Director / Authorized Signatory KYC','—']] as const;return <div><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onFile}/><div className="card p-5 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"><div className="flex items-center justify-between flex-wrap gap-4"><div><div className="section-label mb-1">Verification Completeness</div><div className="flex items-end gap-2"><span className="text-4xl font-bold text-primary font-mono">{score}</span><span className="text-muted-foreground text-sm mb-1">/ 100</span></div><p className="text-xs text-muted-foreground mt-1">Based on current verification completeness</p></div><div className="flex flex-col gap-2 min-w-[200px]">{[['GST Registration Verified',checks[0]],['Business PAN Verified',checks[1]],['Bank Account Linked',checks[2]],['Director KYC',checks[3]],['End-Use Declaration',checks[4]]].map(([label,done]:any)=><div key={label} className="flex items-center gap-2 text-xs">{done?<CheckCircle2 size={13} className="text-success"/>:<AlertCircle size={13} className="text-warning"/>}<span>{label}</span></div>)}</div></div><div className="mt-4"><div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Verification Progress</span><span>{complete} of 5 complete</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{width:`${score}%`}}/></div></div></div><SectionCard title="KYC & Compliance Documents" subtitle="Required documents for buyer verification and procurement eligibility">{rows.map(([type,title,num])=><div key={type} onClick={()=>{}}><DocRow icon={<ShieldCheck size={16} className="text-primary"/>} title={title} number={num} status={status(type)} submittedOn={docs.find(x=>x.type===type)?.uploadedAt?.slice(0,10)} onUpload={()=>upload(type)} onView={docs.some(x=>x.type===type)?()=>view(type):undefined}/></div>)}</SectionCard><SectionCard title="Verification Timeline" subtitle="History of your compliance submissions and approvals"><div className="space-y-3">{docs.map((d:any)=><div key={d.id} className="flex items-start gap-3"><VerificationBadge status={d.status==='VERIFIED'?'verified':d.status==='REJECTED'?'rejected':'under_review'}/><div><div className="text-sm text-foreground">{d.type.replaceAll('_',' ')} — {d.status.replaceAll('_',' ')}</div><div className="text-xs text-muted-foreground mt-0.5">{d.uploadedAt?.slice(0,10)}</div></div></div>)}</div></SectionCard></div>}

// ─── Tab: Bank Account ────────────────────────────────────────────────────────

interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  verified: boolean;
  primary: boolean;
}

function BankAccountTab() {
  const [showFull, setShowFull] = useState<string | null>(null);
  const [accounts,setAccounts] = useState<BankAccount[]>([]); const [bankForm,setBankForm]=useState({accountHolderName:'',bankName:'',accountNumber:'',confirmAccountNumber:'',ifsc:'',accountType:'Current Account'}); useEffect(()=>{buyerApi.bankAccounts().then(setAccounts).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load bank accounts'));},[]); const addBank=async()=>{if(!bankForm.accountHolderName||!bankForm.bankName||!bankForm.accountNumber||!bankForm.ifsc){toast.error('Complete required bank details');return}if(bankForm.accountNumber!==bankForm.confirmAccountNumber){toast.error('Account numbers do not match');return}try{await buyerApi.addBankAccount(bankForm);setAccounts(await buyerApi.bankAccounts());setBankForm({accountHolderName:'',bankName:'',accountNumber:'',confirmAccountNumber:'',ifsc:'',accountType:'Current Account'});toast.success('Bank account added')}catch(e){toast.error(e instanceof Error?e.message:'Unable to add account')}}; const setPrimary=async(id:string)=>{await buyerApi.setPrimaryBank(id);setAccounts(await buyerApi.bankAccounts())};const removeBank=async(id:string)=>{await buyerApi.deleteBank(id);setAccounts(await buyerApi.bankAccounts())}; /*
    {
      id: 'ba-1',
      bankName: 'HDFC Bank',
      accountType: 'Current Account',
      accountNumber: '•••• •••• 7890',
      ifsc: 'HDFC0002345',
      branch: 'Vashi, Navi Mumbai',
      verified: true,
      primary: true,
    },
    {
      id: 'ba-2',
      bankName: 'ICICI Bank',
      accountType: 'Current Account',
      accountNumber: '•••• •••• 4321',
      ifsc: 'ICIC0001122',
      branch: 'Belapur, Navi Mumbai',
      verified: true,
      primary: false,
    },
*/

  return (
    <div>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-6 text-xs text-primary">
        <Info size={13} className="flex-shrink-0" />
        Bank accounts are used for UCO procurement payments and refund processing. Payment status is confirmed only after the configured payment provider verifies settlement.
      </div>

      <SectionCard
        title="Linked Bank Accounts"
        subtitle="Accounts used for procurement payments and refunds"
        action={
          <button className="btn-primary text-xs px-3 py-1.5 gap-1.5">
            <Plus size={13} />Add Account
          </button>
        }
      >
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Landmark size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{acc.bankName} — {acc.accountType}</span>
                  {acc.primary && (
                    <span className="badge-active text-xs inline-flex items-center gap-1">
                      <Star size={10} />Primary
                    </span>
                  )}
                  {acc.verified ? (
                    <span className="badge-active text-xs inline-flex items-center gap-1">
                      <CheckCircle2 size={10} />Verified
                    </span>
                  ) : (
                    <span className="badge-pending text-xs inline-flex items-center gap-1">
                      <Clock size={10} />Unverified
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">IFSC: {acc.ifsc} · Branch: {acc.branch}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-foreground">
                    {acc.accountNumber}
                  </span>
                  <button
                    onClick={() => setShowFull(showFull === acc.id ? null : acc.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showFull === acc.id ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!acc.primary && (
                  <button onClick={()=>setPrimary(acc.id)} className="btn-ghost text-xs px-2.5 py-1.5">Set Primary</button>
                )}
                <button onClick={()=>removeBank(acc.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Add New Bank Account" subtitle="Link a new current or savings account for procurement payments">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Account Holder Name', placeholder: 'As per bank records' },
            { label: 'Bank Name', placeholder: 'e.g. HDFC Bank' },
            { label: 'Account Number', placeholder: 'Enter account number' },
            { label: 'Confirm Account Number', placeholder: 'Re-enter account number' },
            { label: 'IFSC Code', placeholder: 'e.g. HDFC0001234' },
            { label: 'Account Type', placeholder: 'Current / Savings' },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="label-text">{label}</label>
              <input className="input-field" placeholder={placeholder} value={bankForm[({ 'Account Holder Name':'accountHolderName','Bank Name':'bankName','Account Number':'accountNumber','Confirm Account Number':'confirmAccountNumber','IFSC Code':'ifsc','Account Type':'accountType'} as Record<string,keyof typeof bankForm>)[label]]} onChange={e=>setBankForm(f=>({...f,[({ 'Account Holder Name':'accountHolderName','Bank Name':'bankName','Account Number':'accountNumber','Confirm Account Number':'confirmAccountNumber','IFSC Code':'ifsc','Account Type':'accountType'} as Record<string,string>)[label]]:e.target.value}))} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={addBank} className="btn-primary text-xs px-4 py-2 gap-1.5">
            <Plus size={13} />Add & Verify Account
          </button>
          <button className="btn-ghost text-xs px-4 py-2">Cancel</button>
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

  useEffect(()=>{buyerApi.profile().then(p=>setForm(f=>({...f,primaryName:p.fullName||'',primaryPhone:p.phone||'',primaryEmail:p.email||'',warehouseAddress:[p.address,p.city,p.state,p.pincode].filter(Boolean).join(', '),warehouseContact:p.phone||''}))).catch(()=>{});},[]); const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
        subtitle="Secondary contact for finance and escalation queries"
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
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
        subtitle="Primary location for UCO delivery and logistics coordination"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
            <div className="sm:col-span-2">
              <Field label="Warehouse Address" value={form.warehouseAddress} />
            </div>
            <Field label="Contact Number" value={form.warehouseContact} />
            <Field label="Operating Hours" value={form.warehouseHours} />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <button onClick={onToggle} className="flex-shrink-0 transition-colors duration-150">
        {enabled ? (
          <ToggleRight size={28} className="text-primary" />
        ) : (
          <ToggleLeft size={28} className="text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function SettingsTab() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    paymentAlerts: true,
    pickupReminders: true,
    priceAlerts: false,
    weeklyReport: true,
    marketingEmails: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: false,
  });

  const toggle = (group: 'notifications' | 'security', key: string) => {
    if (group === 'notifications') {
      setNotifications((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));
    } else {
      setSecurity((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));
    }
  };

  return (
    <div>
      <SectionCard title="Notification Preferences" subtitle="Control how and when TUCOR contacts you">
        <ToggleRow
          label="Order Status Updates"
          description="Get notified when your order status changes — confirmed, dispatched, delivered"
          enabled={notifications.orderUpdates}
          onToggle={() => toggle('notifications', 'orderUpdates')}
        />
        <ToggleRow
          label="Payment Alerts"
          description="Receive alerts for payment confirmations, failures, and refund processing"
          enabled={notifications.paymentAlerts}
          onToggle={() => toggle('notifications', 'paymentAlerts')}
        />
        <ToggleRow
          label="Pickup & Delivery Reminders"
          description="Reminders for upcoming UCO pickups and delivery schedule confirmations"
          enabled={notifications.pickupReminders}
          onToggle={() => toggle('notifications', 'pickupReminders')}
        />
        <ToggleRow
          label="Price Drop Alerts"
          description="Get notified when UCO listing prices drop below your preferred threshold"
          enabled={notifications.priceAlerts}
          onToggle={() => toggle('notifications', 'priceAlerts')}
        />
        <ToggleRow
          label="Weekly Procurement Report"
          description="Receive a weekly summary of your procurement activity and spend"
          enabled={notifications.weeklyReport}
          onToggle={() => toggle('notifications', 'weeklyReport')}
        />
        <ToggleRow
          label="Marketing & Promotions"
          description="Occasional updates about new features, promotions, and TUCOR news"
          enabled={notifications.marketingEmails}
          onToggle={() => toggle('notifications', 'marketingEmails')}
        />
      </SectionCard>

      <SectionCard title="Security Settings" subtitle="Manage your account security and access controls">
        <ToggleRow
          label="Two-Factor Authentication"
          description="Require OTP verification on every login for enhanced account security"
          enabled={security.twoFactor}
          onToggle={() => toggle('security', 'twoFactor')}
        />
        <ToggleRow
          label="Login Activity Alerts"
          description="Get notified via email when a new device or location logs into your account"
          enabled={security.loginAlerts}
          onToggle={() => toggle('security', 'loginAlerts')}
        />
        <ToggleRow
          label="Auto Session Timeout"
          description="Automatically log out after 30 minutes of inactivity"
          enabled={security.sessionTimeout}
          onToggle={() => toggle('security', 'sessionTimeout')}
        />
      </SectionCard>

      <SectionCard title="Password & Access" subtitle="Update your login credentials">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label-text">Current Password</label>
            <input className="input-field" type="password" placeholder="••••••••" />
          </div>
          <div />
          <div>
            <label className="label-text">New Password</label>
            <input className="input-field" type="password" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="label-text">Confirm New Password</label>
            <input className="input-field" type="password" placeholder="Re-enter new password" />
          </div>
        </div>
        <button className="btn-primary text-xs px-4 py-2 gap-1.5">
          <Lock size={13} />Update Password
        </button>
      </SectionCard>

      <SectionCard title="Danger Zone" subtitle="Irreversible account actions — proceed with caution">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border">
            <div>
              <div className="text-sm font-medium text-foreground">Deactivate Account</div>
              <div className="text-xs text-muted-foreground mt-0.5">Temporarily suspend your buyer account. You can reactivate anytime.</div>
            </div>
            <button className="btn-secondary text-xs px-3 py-1.5 text-warning border-warning/30 hover:bg-warning/5">
              Deactivate
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div>
              <div className="text-sm font-medium text-red-700">Delete Account</div>
              <div className="text-xs text-red-500 mt-0.5">Permanently delete your account and all associated data. This cannot be undone.</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: 'company', label: 'Company Details', icon: Building2 },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'bank', label: 'Bank Account', icon: Landmark },
  { id: 'contact', label: 'Contact Info', icon: Phone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BuyerBusinessProfileSection() {
  const [activeTab, setActiveTab] = useState('company');

  const renderTab = () => {
    switch (activeTab) {
      case 'company': return <CompanyDetailsTab />;
      case 'verification': return <VerificationTab />;
      case 'bank': return <BankAccountTab />;
      case 'contact': return <ContactInfoTab />;
      case 'settings': return <SettingsTab />;
      default: return <CompanyDetailsTab />;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Business Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your registered business details, verification status, bank accounts, and account settings.
        </p>
      </div>

      {/* Profile Summary Banner */}
      <div className="card p-5 mb-6 flex items-center gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          B
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">BioFuel India Pvt. Ltd.</h2>
            <VerificationBadge status="verified" label="KYC Verified" />
          </div>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 size={12} />Biodiesel Manufacturer
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={12} />Navi Mumbai, Maharashtra
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe size={12} />www.biofuelindia.in
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">82</div>
            <div className="text-xs text-muted-foreground">Trust Score</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground font-mono">3/5</div>
            <div className="text-xs text-muted-foreground">KYC Complete</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1 mb-6 border-b border-border">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium whitespace-nowrap transition-all duration-150 border-b-2 -mb-px ${
                isActive
                  ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <TabIcon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderTab()}
    </div>
  );
}
