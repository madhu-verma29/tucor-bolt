'use client';

import React, { useEffect, useRef, useState } from 'react';
import { buyerApi, downloadBuyerDocument, uploadBuyerDocument } from '@/lib/buyer-api';
import { toast } from 'sonner';
import {
  CheckCircle2, Clock, AlertCircle, XCircle, RefreshCw, Upload,
  FileText, ShieldCheck, ChevronRight, Info, Download,
} from 'lucide-react';

type DocStatus = 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted' | 'Expired';
type OverallStatus = 'verified' | 'pending' | 'under_review' | 'rejected';

interface ComplianceDoc {
  id: string;
  name: string;
  description: string;
  status: DocStatus;
  submittedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  required: boolean;
}

const REQUIRED_DOCS=[{id:'GST',name:'GST Certificate',description:'Goods and Services Tax registration certificate for your business',required:true},{id:'FSSAI_OR_REGISTRATION',name:'Company Registration',description:'Certificate of Incorporation or Partnership Deed',required:true},{id:'PAN',name:'PAN Card',description:'Permanent Account Number card of the business entity',required:true},{id:'BANK_PROOF',name:'Bank Details / Cancelled Cheque',description:'Cancelled cheque or bank statement for payment processing',required:true},{id:'ADDRESS_PROOF',name:'Address Proof',description:'Registered business address proof (utility bill, lease agreement)',required:true},{id:'POLLUTION_CONTROL',name:'Pollution Control Certificate',description:'NOC from State Pollution Control Board for biodiesel processing',required:true},{id:'ISO',name:'ISO / Quality Certification',description:'ISO 9001 or relevant quality management certification (optional)',required:false}];

const statusConfig: Record<DocStatus, { cls: string; icon: React.ReactNode; label: string }> = {
  Verified: { cls: 'badge-active', icon: <CheckCircle2 size={12} />, label: 'Verified' },
  Pending: { cls: 'badge-pending', icon: <Clock size={12} />, label: 'Under Review' },
  Rejected: { cls: 'badge-danger', icon: <XCircle size={12} />, label: 'Rejected' },
  'Not Submitted': { cls: 'badge-muted', icon: <AlertCircle size={12} />, label: 'Not Submitted' },
  Expired: { cls: 'badge-danger', icon: <AlertCircle size={12} />, label: 'Expired' },
};

export default function BuyerVerificationSection() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null); const [docs,setDocs]=useState<Awaited<ReturnType<typeof buyerApi.documents>>>([]);const fileRef=useRef<HTMLInputElement>(null);const [uploadType,setUploadType]=useState('');const load=()=>buyerApi.documents().then(setDocs).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load documents'));useEffect(()=>{load()},[]);const mapped:ComplianceDoc[]=REQUIRED_DOCS.map(d=>{const x=docs.find(v=>v.type===d.id);return {...d,status:!x?'Not Submitted':x.expiresAt&&new Date(x.expiresAt)<new Date()?'Expired':x.status==='VERIFIED'?'Verified':x.status==='REJECTED'?'Rejected':'Pending',submittedAt:x?.uploadedAt?.slice(0,10),expiresAt:x?.expiresAt,rejectionReason:x?.rejectionReason}});const upload=(type:string)=>{setUploadType(type);fileRef.current?.click()};const onFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;try{await uploadBuyerDocument(uploadType,f);toast.success('Document uploaded');await load()}catch(err){toast.error(err instanceof Error?err.message:'Upload failed')}finally{e.target.value=''}};const download=async(type:string)=>{const d=docs.find(x=>x.type===type);if(!d)return;try{const blob=await downloadBuyerDocument(d.id);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=d.name;a.click();URL.revokeObjectURL(url)}catch(err){toast.error(err instanceof Error?err.message:'Download failed')}};

  const requiredDocuments = mapped.filter((d) => d.required);
  const verified = requiredDocuments.filter((d) => d.status === 'Verified').length;
  const total = mapped.filter((d) => d.required).length;
  const overallStatus: OverallStatus = verified === total ? 'verified' : requiredDocuments.some(d=>d.status==='Rejected'||d.status==='Expired') ? 'rejected' : requiredDocuments.every(d=>d.status==='Not Submitted') ? 'pending' : 'under_review';

  const overallConfig = {
    verified: { label: 'Fully Verified', cls: 'bg-success/10 border-success/30 text-success', icon: <ShieldCheck size={20} className="text-success" /> },
    under_review: { label: 'Verification In Progress', cls: 'bg-warning/10 border-warning/30 text-warning', icon: <RefreshCw size={20} className="text-warning" /> },
    pending: { label: 'Pending Submission', cls: 'bg-muted border-border text-muted-foreground', icon: <Clock size={20} className="text-muted-foreground" /> },
    rejected: { label: 'Verification Rejected', cls: 'bg-danger/10 border-danger/30 text-danger', icon: <XCircle size={20} className="text-danger" /> },
  };

  return (
    <div className="flex flex-col gap-6"><input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onFile}/>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verification Status</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your TUCOR buyer verification progress and compliance checklist
        </p>
      </div>

      {/* Overall status banner */}
      <div className={`card p-5 border ${overallConfig[overallStatus].cls} flex items-center gap-4 flex-wrap`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {overallConfig[overallStatus].icon}
          <div>
            <div className="font-bold text-base">{overallConfig[overallStatus].label}</div>
            <div className="text-xs opacity-80 mt-0.5">
              {verified} of {total} required documents verified · Updated from your submitted documents
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono-data">{Math.round((verified / total) * 100)}%</div>
            <div className="text-xs opacity-70">Complete</div>
          </div>
          <div className="w-16 h-16 relative flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${(verified / total) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Verified', value: mapped.filter((d) => d.status === 'Verified').length, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
          { label: 'Under Review', value: mapped.filter((d) => d.status === 'Pending').length, color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
          { label: 'Action Required', value: mapped.filter((d) => d.status === 'Rejected').length, color: 'text-danger', bg: 'bg-danger/10', icon: XCircle },
          { label: 'Not Submitted', value: mapped.filter((d) => d.status === 'Not Submitted').length, color: 'text-muted-foreground', bg: 'bg-muted', icon: AlertCircle },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={`buyer-ver-stat-${stat.label}`} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <StatIcon size={16} className={stat.color} />
              </div>
              <div>
                <div className={`text-xl font-bold font-mono-data ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document checklist */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-foreground mb-4">Compliance Document Checklist</h3>
        <div className="flex flex-col gap-3">
          {mapped.map((doc) => {
            const cfg = statusConfig[doc.status];
            const isExpanded = expandedDoc === doc.id;
            return (
              <div key={`buyer-ver-doc-${doc.id}`} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.status === 'Verified' ? 'bg-success/10' :
                    doc.status === 'Pending' ? 'bg-warning/10' :
                    doc.status === 'Rejected' ? 'bg-danger/10' : 'bg-muted'
                  }`}>
                    <FileText size={16} className={
                      doc.status === 'Verified' ? 'text-success' :
                      doc.status === 'Pending' ? 'text-warning' :
                      doc.status === 'Rejected' ? 'text-danger' : 'text-muted-foreground'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{doc.name}</span>
                      {doc.required && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Required</span>
                      )}
                      <span className={`${cfg.cls} inline-flex items-center gap-1 text-xs`}>{cfg.icon}{cfg.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{doc.description}</div>
                  </div>
                  <ChevronRight size={16} className={`text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/20">
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {doc.submittedAt && (
                        <div>
                          <div className="text-muted-foreground mb-0.5">Submitted</div>
                          <div className="font-medium text-foreground">{doc.submittedAt}</div>
                        </div>
                      )}
                      {doc.expiresAt && (
                        <div>
                          <div className="text-muted-foreground mb-0.5">Expires</div>
                          <div className="font-medium text-foreground">{doc.expiresAt}</div>
                        </div>
                      )}
                    </div>
                    {doc.rejectionReason && (
                      <div className="mt-3 p-3 rounded-xl bg-danger/8 border border-danger/20 flex items-start gap-2">
                        <Info size={13} className="text-danger flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-danger">{doc.rejectionReason}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      {(doc.status === 'Rejected' || doc.status === 'Not Submitted' || doc.status === 'Expired') && (
                        <button onClick={()=>upload(doc.id)} className="btn-primary py-1.5 px-3 text-xs gap-1">
                          <Upload size={12} />
                          {doc.status === 'Rejected' ? 'Re-upload' : 'Upload'}
                        </button>
                      )}
                      {doc.status === 'Verified' && (
                        <button onClick={()=>download(doc.id)} className="btn-ghost py-1.5 px-3 text-xs gap-1">
                          <Download size={12} />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification timeline */}<div className="card p-6"><h3 className="text-base font-bold text-foreground mb-4">Verification Timeline</h3><div className="relative"><div className="absolute left-4 top-0 bottom-0 w-px bg-border" /><div className="flex flex-col gap-4">{docs.map((d:any)=><div key={d.id} className="flex items-start gap-4 pl-10 relative"><div className="absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 bg-warning border-warning" /><div><div className="text-sm font-medium text-foreground">{d.type.replaceAll('_',' ')} submitted — {d.status.replaceAll('_',' ')}</div><div className="text-xs text-muted-foreground mt-0.5">{d.uploadedAt?.slice(0,10)}</div></div></div>)}</div></div></div>
    </div>
  );
}
